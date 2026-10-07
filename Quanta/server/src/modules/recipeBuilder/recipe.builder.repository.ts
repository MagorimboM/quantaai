import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type { NewRecipeRecord } from '@/modules/recipeBuilder/contracts/recipeBuilder.request.contracts';
import type {
  Category,
  SiteCondition,
  MaterialSearchResult,
  CreateRecipeResponse,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts';

// The most materials one search returns
const SEARCH_RESULT_LIMIT = 50;

// OWNERSHIP MODEL: userId owns all data; companyId is a tag on it. Every read
// of the company's categories and materials is filtered by both, so a recipe can
// only ever be built from the caller's own materials.
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

  // Ground conditions are a shared list, the same for every company
  async getListOfSiteConditions(): Promise<SiteCondition[]> {
    return await prisma.$queryRaw<SiteCondition[]>`
      SELECT s.id, s.name
      FROM site_conditions s
      ORDER BY s.name ASC`;
  }

  // The company's materials, optionally narrowed by a name fragment and a
  // category. Each filter is skipped when it is null.
  //
  // Site condition rule: a material with no site condition is general and always
  // offered. A material made for one ground (geotextile for muddy sites) is only
  // offered when the recipe is tagged with that same ground. With no site
  // condition chosen, only general materials come back.
  //
  // Only id, name and unit are read, each under its own name: that is all the
  // material picker needs.
  async searchMaterials(request: {
    companyId: string;
    userId: string;
    term?: string;
    categoryId?: string;
    siteConditionId?: string;
  }): Promise<MaterialSearchResult[]> {
    const pattern = request.term ? `%${request.term}%` : null;
    const categoryId = request.categoryId ?? null;
    const siteConditionId = request.siteConditionId ?? null;

    return await prisma.$queryRaw<MaterialSearchResult[]>`
      SELECT m.id, m.name, m.unit
      FROM materials m
      WHERE m."companyId" = ${request.companyId}
        AND m."userId" = ${request.userId}
        AND (${categoryId}::text IS NULL OR m."categoryId" = ${categoryId})
        AND (${pattern}::text IS NULL OR m.name ILIKE ${pattern})
        AND (m."siteConditionId" IS NULL OR m."siteConditionId" = ${siteConditionId})
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

  async siteConditionExists(siteConditionId: string): Promise<boolean> {
    const count = await prisma.siteCondition.count({
      where: { id: siteConditionId },
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

  // Saves the recipe and its ingredients together: either both are stored or,
  // if anything fails, neither is, so there is never a recipe with half its lines.
  async createNewRecipe(record: NewRecipeRecord): Promise<CreateRecipeResponse> {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.$queryRaw<CreateRecipeResponse[]>`
        INSERT INTO recipes
          (id, "userId", "companyId", "categoryId", "siteConditionId",
           name, description, unit, "isArchived", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${record.userId},
          ${record.companyId},
          ${record.categoryId},
          ${record.siteConditionId},
          ${record.name},
          ${record.description},
          ${record.unit},
          false,
          now(),
          now()
        )
        RETURNING id, name`;
      const recipe = created[0];

      await tx.recipeMaterial.createMany({
        data: record.ingredients.map((ingredient) => ({
          userId: record.userId,
          recipeId: recipe.id,
          materialId: ingredient.materialId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })),
      });

      return recipe;
    });
  }
}