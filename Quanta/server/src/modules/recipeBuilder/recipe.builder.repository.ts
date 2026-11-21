import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type {
  NewRecipeRecord,
  NewSiteClassRecord,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.request.contracts';
import type {
  Category,
  SiteClassOption,
  BuildingClassOption,
  MaterialSearchResult,
  CreateRecipeResponse,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts';

// The most materials one search returns
const SEARCH_RESULT_LIMIT = 50;

// The most rows the type-ahead searches return
const TYPEAHEAD_LIMIT = 10;

// AS 2870 order, least reactive to most, then problem sites. Site classes with
// other names go after these, alphabetically.
const SITE_CLASS_ORDER = ['a', 's', 'm', 'h1', 'h2', 'e', 'p'];

// "Class H1" and "H1" both sort as "h1"
function siteClassRank(name: string): number {
  const code = name.trim().toLowerCase().replace(/^class\s+/, '');
  const index = SITE_CLASS_ORDER.indexOf(code);
  return index === -1 ? SITE_CLASS_ORDER.length : index;
}

// OWNERSHIP MODEL: userId owns all data; companyId is a tag on it. Every read
// of the company's categories and materials is filtered by both, so a recipe can
// only ever be built from the caller's own materials. Site classes and building
// classes belong to the user only (no companyId), so they are filtered by userId.
@Injectable()
export class RecipeBuilderRepository {
  // The company's categories. They are the recipe types, and also the groups
  // materials sit in, so one list serves both the type dropdown and the
  // material filter.
  async getListOfCategories(
    companyId: string,
    userId: string,
  ): Promise<Category[]> {
    return await prisma.$queryRaw<Category[]>`
      SELECT c.id, c.name
      FROM categories c
      WHERE c."companyId" = ${companyId}
        AND c."userId" = ${userId}
      ORDER BY c.name ASC`;
  }

  // The user's building classes, for the "suits these buildings" picker
  async getListOfBuildingClasses(
    userId: string,
  ): Promise<BuildingClassOption[]> {
    return await prisma.buildingClass.findMany({
      where: { userId },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, description: true },
    });
  }

  // The user's site classes, in AS 2870 order (A, S, M, H1, H2, E, P), then
  // any they added themselves, alphabetically
  async getListOfSiteClasses(userId: string): Promise<SiteClassOption[]> {
    const rows = await prisma.siteClass.findMany({
      where: { userId },
      select: { id: true, name: true, description: true },
    });
    return rows.sort(
      (a, b) =>
        siteClassRank(a.name) - siteClassRank(b.name) ||
        a.name.localeCompare(b.name),
    );
  }

  // True if the user already has a site class with this name (ignoring case)
  async siteClassNameExists(userId: string, name: string): Promise<boolean> {
    const count = await prisma.siteClass.count({
      where: { userId, name: { equals: name, mode: 'insensitive' } },
    });
    return count > 0;
  }

  // Adds a site class the user was missing. The service has already checked
  // the name is new for them.
  async createSiteClass(record: NewSiteClassRecord): Promise<SiteClassOption> {
    return await prisma.siteClass.create({
      data: {
        userId: record.userId,
        name: record.name,
        description: record.description,
      },
      select: { id: true, name: true, description: true },
    });
  }

  // How many of the given building classes really are the user's
  async countOwnedBuildingClasses(
    userId: string,
    buildingClassIds: string[],
  ): Promise<number> {
    return await prisma.buildingClass.count({
      where: { id: { in: buildingClassIds }, userId },
    });
  }

  // How many of the given site classes really are the user's
  async countOwnedSiteClasses(
    userId: string,
    siteClassIds: string[],
  ): Promise<number> {
    return await prisma.siteClass.count({
      where: { id: { in: siteClassIds }, userId },
    });
  }

  // The company's materials, optionally narrowed by a name fragment and a
  // category. Each filter is skipped when it is null.
  //
  // Only id, name and unit are read, each under its own name: that is all the
  // material picker needs.
  async searchMaterials(request: {
    companyId: string;
    userId: string;
    term?: string;
    categoryId?: string;
  }): Promise<MaterialSearchResult[]> {
    const pattern = request.term ? `%${request.term}%` : null;
    const categoryId = request.categoryId ?? null;

    return await prisma.$queryRaw<MaterialSearchResult[]>`
      SELECT m.id, m.name, m.unit
      FROM materials m
      WHERE m."companyId" = ${request.companyId}
        AND m."userId" = ${request.userId}
        AND (${categoryId}::text IS NULL OR m."categoryId" = ${categoryId})
        AND (${pattern}::text IS NULL OR m.name ILIKE ${pattern})
      ORDER BY m.name ASC
      LIMIT ${SEARCH_RESULT_LIMIT}`;
  }

  // Of the given materials, the ones that really belong to this company and
  // user, with their units. Used to stop a recipe being built from someone
  // else's materials, and to take each ingredient's unit from the material.
  async findOwnedMaterials(
    companyId: string,
    userId: string,
    materialIds: string[],
  ): Promise<{ id: string; unit: string }[]> {
    return await prisma.material.findMany({
      where: { id: { in: materialIds }, companyId, userId },
      select: { id: true, unit: true },
    });
  }

  async categoryExists(
    companyId: string,
    userId: string,
    categoryId: string,
  ): Promise<boolean> {
    const count = await prisma.category.count({
      where: { id: categoryId, companyId, userId },
    });
    return count > 0;
  }

  // True if the company already has a live recipe with this name (ignoring
  // case). Archived recipes don't count: archiving frees the name.
  async recipeNameExists(
    companyId: string,
    userId: string,
    name: string,
  ): Promise<boolean> {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT r.id
      FROM recipes r
      WHERE r."companyId" = ${companyId}
        AND r."userId" = ${userId}
        AND r."isArchived" = false
        AND lower(r.name) = lower(${name})
      LIMIT 1`;
    return rows.length > 0;
  }

  // Saves the recipe, its ingredients and its building / site class links
  // together: either all are stored or, if anything fails, none is, so there is
  // never a recipe with half its lines.
  //
  // Every recipe uses the Rate-based form until the form chooser exists. Needs
  // the Rate-based form type and a form of that type to be seeded.
  async createNewRecipe(
    record: NewRecipeRecord,
  ): Promise<CreateRecipeResponse> {
    return await prisma.$transaction(async (tx) => {
      const rateBasedForm = await tx.form.findFirstOrThrow({
        where: { formType: { code: 'RATE_BASED' } },
        select: { id: true },
      });

      const recipe = await tx.recipe.create({
        data: {
          userId: record.userId,
          companyId: record.companyId,
          categoryId: record.categoryId,
          formId: rateBasedForm.id,
          name: record.name,
          description: record.description,
          unit: record.unit,
          recipeMaterials: {
            create: record.ingredients.map((ingredient) => ({
              userId: record.userId,
              materialId: ingredient.materialId,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            })),
          },
          recipeBuildingClasses: {
            create: record.buildingClassIds.map((buildingClassId) => ({
              userId: record.userId,
              buildingClassId,
            })),
          },
          recipeSiteClasses: {
            create: record.siteClassIds.map((siteClassId) => ({
              userId: record.userId,
              siteClassId,
            })),
          },
        },
        select: { id: true, name: true },
      });

      return recipe;
    });
  }

  // TODO :: to include pagination/offset
  async searchRecipeCategory(term: string, clerkId: string) {
    const user = await prisma.user.findFirst({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('user does not exist');

    return await prisma.category.findMany({
      where: {
        userId: user.id,
        name: { contains: term, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
      take: TYPEAHEAD_LIMIT,
      select: { id: true, name: true, description: true },
    });
  }

  // TODO :: to include pagination/offset
  async searchRecipeMaterial(term: string, clerkId: string) {
    const user = await prisma.user.findFirst({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('user does not exist');

    return await prisma.material.findMany({
      where: {
        userId: user.id,
        name: { contains: term, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
      take: TYPEAHEAD_LIMIT,
      select: { id: true, name: true, description: true, unit: true },
    });
  }
}