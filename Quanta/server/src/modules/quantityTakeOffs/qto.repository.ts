import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type {
  BillOfQuantsScope,
  UpdateProjectLineItemsRequest,
  UpdateProjectStatusRequest,
  DeleteProjectLineItemsRequest,
  GetRecipeOptionsRequest,
  AddLineItemRequest,
} from '@/modules/quantityTakeOffs/contracts/qto.request.contracts';
import type {
  GetBillOfQuantsResponse,
  GetRecipeOptionsResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantsResponse,
} from '@/modules/quantityTakeOffs/contracts/qto.response.contracts';

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
  // description, note and every component, so the picker can preview it and
  // work out totals in the browser as the measurement is typed. Archived
  // recipes are left out: they keep working on takeoffs that already use them,
  // but can't be picked again.
  // TODO :: [backend] Sends every recipe at once. Page or search on the server
  // when libraries grow large.
  async getRecipeOptions(
    request: GetRecipeOptionsRequest,
  ): Promise<GetRecipeOptionsResponse> {
    return await prisma.recipe.findMany({
      where: { companyId: request.companyId, isArchived: false },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: {
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
      },
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