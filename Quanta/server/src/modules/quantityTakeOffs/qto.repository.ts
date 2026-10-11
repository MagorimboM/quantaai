import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type {
  BillOfQuantsScope,
  UpdateProjectLineItemsRequest,
  UpdateProjectStatusRequest,
  DeleteProjectLineItemsRequest,
  GetRecipeOptionsRequest,
  AddLineItemRequest,
  GetRecipeCatalogueRequest,
  CreateCatalogueItemRequest,
  CreateCategoryRequest,
  CreateRecipeRequest,
} from '@/modules/quantityTakeOffs/contracts/qto.request.contracts';
import type {
  GetBillOfQuantsResponse,
  GetRecipeOptionsResponse,
  GetRecipeCatalogueResponse,
  CreateCatalogueItemResponse,
  CreateCategoryResponse,
  CreateRecipeResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantsResponse,
} from '@/modules/quantityTakeOffs/contracts/qto.response.contracts';

// What a company can see in its catalogue: its own rows plus the shared ones
// that belong to no company (companyId null).
function visibleTo(companyId: string) {
  return { OR: [{ companyId }, { companyId: null }] };
}

// The one place that decides what a recipe looks like in the picker, so a recipe
// that was just created is shaped exactly like one that was loaded.
const recipeOptionSelect = {
  id: true,
  name: true,
  unit: true,
  description: true,
  category: { select: { id: true, name: true } },
  recipeMaterials: {
    select: {
      id: true,
      quantity: true,
      unit: true,
      material: { select: { id: true, name: true } },
    },
  },
  recipeLabour: {
    select: {
      id: true,
      quantity: true,
      unit: true,
      labour: { select: { id: true, name: true } },
    },
  },
  recipeOverheads: {
    select: {
      id: true,
      quantity: true,
      unit: true,
      overhead: { select: { id: true, name: true } },
    },
  },
} as const;

const catalogueItemSelect = {
  id: true,
  name: true,
  unit: true,
  categoryId: true,
} as const;

// Every method here assumes the caller was already checked to own the project
// (see AccessService), so queries only need to stay inside its company and project.
//
// A takeoff is stored as takeoff_items: one row per line, each pointing at the
// recipe it applies and holding the measurement the quantities are worked out from.
@Injectable()
export class QuantityTakeOffsRepository {
  // Every line of the project's takeoff, each with its recipe and the
  // components needed to calculate quantities.
  async getProjectBillOfQuants(
    request: BillOfQuantsScope,
  ): Promise<GetBillOfQuantsResponse[]> {
    return await this.findLineItems({
      companyId: request.companyId,
      projectId: request.projectId,
    });
  }

  // The one place that decides what a takeoff line looks like to the screen, so
  // a line that was just added is shaped exactly like one that was loaded. Only
  // the fields the screen uses are read. The order is stable so lines don't
  // shuffle after a save: createdAt alone isn't enough (rows inserted in one
  // statement share a timestamp), so id is the tie-breaker.
  private async findLineItems(where: {
    companyId: string;
    projectId: string;
    id?: string;
  }): Promise<GetBillOfQuantsResponse[]> {
    return await prisma.takeoffItem.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        description: true,
        measurement: true,
        unit: true,
        notes: true,
        recipe: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: { select: { id: true, name: true } },
            recipeMaterials: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                material: { select: { id: true, name: true } },
              },
            },
            recipeLabour: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                labour: { select: { id: true, name: true } },
              },
            },
            recipeOverheads: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                overhead: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  // The company's recipes that can newly be put on a takeoff, each with its
  // description and every component, so the picker can preview it and work out
  // totals in the browser as the measurement is typed. Archived recipes are
  // left out: they keep working on takeoffs that already use them, but can't be
  // picked again.
  // TODO :: [backend] Sends every recipe at once. Page or search on the server
  // when libraries grow large.
  async getRecipeOptions(
    request: GetRecipeOptionsRequest,
  ): Promise<GetRecipeOptionsResponse> {
    return await prisma.recipe.findMany({
      where: { companyId: request.companyId, isArchived: false },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: recipeOptionSelect,
    });
  }

  // Everything a recipe can be built from, in one request: the form searches it
  // in the browser while the user types. Rows with no company are shared ones.
  // TODO :: [backend] Sends the whole catalogue at once. Search on the server
  // when catalogues grow large.
  async getRecipeCatalogue(
    request: GetRecipeCatalogueRequest,
  ): Promise<GetRecipeCatalogueResponse> {
    const where = visibleTo(request.companyId);
    const orderBy = [{ name: 'asc' as const }, { id: 'asc' as const }];

    const [categories, materials, labour, overheads] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        select: { id: true, name: true },
      }),
      prisma.material.findMany({ where, orderBy, select: catalogueItemSelect }),
      prisma.labour.findMany({ where, orderBy, select: catalogueItemSelect }),
      prisma.overhead.findMany({ where, orderBy, select: catalogueItemSelect }),
    ]);

    return { categories, materials, labour, overheads };
  }

  // Adds a material, labour or overhead that was missing. The category must be
  // one this company can see, otherwise someone could file the item under
  // another company's category by sending its id.
  async createCatalogueItem(
    request: CreateCatalogueItemRequest,
  ): Promise<CreateCatalogueItemResponse> {
    const category = await prisma.category.findFirst({
      where: { id: request.categoryId, ...visibleTo(request.companyId) },
      select: { id: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const data = {
      userId: request.userId,
      companyId: request.companyId,
      categoryId: category.id,
      name: request.name,
      unit: request.unit,
    };

    if (request.kind === 'material') {
      return await prisma.material.create({
        data,
        select: catalogueItemSelect,
      });
    }
    if (request.kind === 'labour') {
      return await prisma.labour.create({
        data: { ...data, labourType: request.labourType! },
        select: catalogueItemSelect,
      });
    }
    return await prisma.overhead.create({
      data,
      select: catalogueItemSelect,
    });
  }

  async createCategory(
    request: CreateCategoryRequest,
  ): Promise<CreateCategoryResponse> {
    return await prisma.category.create({
      data: {
        userId: request.userId,
        companyId: request.companyId,
        name: request.name,
      },
      select: { id: true, name: true },
    });
  }

  // Creates a recipe and its components together, or nothing at all: a recipe
  // saved without its components would be an empty shell on the takeoff.
  //
  // The category and every component must be rows this company can see, and
  // each component takes its unit from its catalogue item (a brick is counted
  // in Nr wherever it is used), which is why the browser never sends one.
  async createRecipe(
    request: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    return await prisma.$transaction(async (tx) => {
      const visible = visibleTo(request.companyId);

      const category = await tx.category.findFirst({
        where: { id: request.categoryId, ...visible },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const materialUnits = await tx.material.findMany({
        where: { id: { in: request.materials.map((c) => c.itemId) }, ...visible },
        select: { id: true, unit: true },
      });
      const labourUnits = await tx.labour.findMany({
        where: { id: { in: request.labour.map((c) => c.itemId) }, ...visible },
        select: { id: true, unit: true },
      });
      const overheadUnits = await tx.overhead.findMany({
        where: { id: { in: request.overheads.map((c) => c.itemId) }, ...visible },
        select: { id: true, unit: true },
      });

      const unitOf = (rows: { id: string; unit: string }[], label: string) => {
        const byId = new Map(rows.map((row) => [row.id, row.unit]));
        return (itemId: string) => {
          const unit = byId.get(itemId);
          if (unit === undefined) {
            throw new NotFoundException(`A ${label} in this recipe was not found`);
          }
          return unit;
        };
      };
      const materialUnit = unitOf(materialUnits, 'material');
      const labourUnit = unitOf(labourUnits, 'labour');
      const overheadUnit = unitOf(overheadUnits, 'overhead');

      const created = await tx.recipe.create({
        data: {
          userId: request.userId,
          companyId: request.companyId,
          categoryId: category.id,
          name: request.name,
          description: request.description,
          unit: request.unit,
          recipeMaterials: {
            create: request.materials.map((c) => ({
              userId: request.userId,
              materialId: c.itemId,
              quantity: c.quantity,
              unit: materialUnit(c.itemId),
            })),
          },
          recipeLabour: {
            create: request.labour.map((c) => ({
              userId: request.userId,
              labourId: c.itemId,
              quantity: c.quantity,
              unit: labourUnit(c.itemId),
            })),
          },
          recipeOverheads: {
            create: request.overheads.map((c) => ({
              userId: request.userId,
              overheadId: c.itemId,
              quantity: c.quantity,
              unit: overheadUnit(c.itemId),
            })),
          },
        },
        select: recipeOptionSelect,
      });

      return created;
    });
  }

  // Adds one line: the recipe applied to one measurement. The line takes its
  // unit from the recipe (a wall recipe per m² gives an m² line), which is why
  // the browser never sends a unit. The recipe must be one of this company's
  // and not archived, otherwise someone could attach another company's recipe
  // by sending its id.
  async addLineItem(
    request: AddLineItemRequest,
  ): Promise<GetBillOfQuantsResponse> {
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: request.recipeId,
        companyId: request.companyId,
        isArchived: false,
      },
      select: { id: true, unit: true },
    });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const created = await prisma.takeoffItem.create({
      data: {
        userId: request.userId,
        companyId: request.companyId,
        projectId: request.projectId,
        recipeId: recipe.id,
        description: request.description,
        measurement: request.measurement,
        unit: recipe.unit,
        notes: request.notes,
      },
      select: { id: true },
    });

    const [lineItem] = await this.findLineItems({
      companyId: request.companyId,
      projectId: request.projectId,
      id: created.id,
    });
    return lineItem;
  }

  // Saves the edited location, notes and measurement of several lines at once.
  // All or nothing: if any line isn't in this project, nothing is saved.
  async updateProjectLineItems(
    request: UpdateProjectLineItemsRequest,
  ): Promise<UpdateLineItemsResponse> {
    const ids = request.lineItems.map((item) => item.id);

    return await prisma.$transaction(async (tx) => {
      // One query finds which of the lines really belong to this project
      const existing = await tx.takeoffItem.findMany({
        where: {
          id: { in: ids },
          companyId: request.companyId,
          projectId: request.projectId,
        },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((item) => item.id));
      const missing = ids.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(
          `Line items not found in this project: ${missing.join(', ')}`,
        );
      }

      for (const item of request.lineItems) {
        await tx.takeoffItem.update({
          where: { id: item.id },
          data: {
            description: item.description,
            measurement: item.measurement,
            notes: item.notes,
          },
        });
      }

      return { success: true, updatedItems: request.lineItems.length };
    });
  }

  // Marks the project's takeoff finished or reopens it. The status shown on the
  // projects list, the completed flag the dashboard counts, and the completion
  // time are all kept in step, so they can't disagree.
  async updateProjectStatus(
    request: UpdateProjectStatusRequest,
  ): Promise<UpdateProjectStatusResponse> {
    return await prisma.project.update({
      where: { id: request.projectId, companyId: request.companyId },
      data: {
        completed: request.completed,
        completedAt: request.completed ? new Date() : null,
        status: request.completed ? 'completed' : 'in_progress',
      },
      select: { id: true, completed: true },
    });
  }

  // Deletes the chosen lines. All or nothing: if any isn't in this project,
  // nothing is deleted. Returns the ids that were deleted.
  async deleteProjectLineItems(
    request: DeleteProjectLineItemsRequest,
  ): Promise<DeletedLineItemsResponse> {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.takeoffItem.findMany({
        where: {
          id: { in: request.lineItemIds },
          companyId: request.companyId,
          projectId: request.projectId,
        },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((item) => item.id));
      const missing = request.lineItemIds.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(
          `Line items not found in this project: ${missing.join(', ')}`,
        );
      }

      await tx.takeoffItem.deleteMany({
        where: {
          id: { in: [...existingIds] },
          companyId: request.companyId,
          projectId: request.projectId,
        },
      });

      return [...existingIds].map((id) => ({ id }));
    });
  }

  // "Start afresh": removes every line of the project's takeoff. The project
  // itself stays.
  async deleteProjectBillOfQuants(
    request: BillOfQuantsScope,
  ): Promise<DeleteProjectBillOfQuantsResponse> {
    const deleted = await prisma.takeoffItem.deleteMany({
      where: { projectId: request.projectId, companyId: request.companyId },
    });

    return { success: true, deletedItems: deleted.count };
  }
}