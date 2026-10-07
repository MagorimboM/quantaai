import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type {
  UserRecipeCategoriesRequest,
  GetRecipesRequest,
  UpdateRecipeRecord,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';
import type {
  Recipe,
  UserRecipeCategoriesResponse,
  GetRecipesResponse,
  ArchiveRecipeResponse,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts';

// The pseudo-category that means "every category"
const ALL_CATEGORIES_ID = 'all';

// What a recipe card needs. Materials are listed alphabetically so the lines
// never shuffle between loads.
const RECIPE_SELECT = {
  id: true,
  name: true,
  description: true,
  unit: true,
  categoryId: true,
  category: { select: { name: true } },
  recipeMaterials: {
    orderBy: { material: { name: 'asc' as const } },
    select: {
      id: true,
      quantity: true,
      unit: true,
      material: { select: { name: true } },
    },
  },
};

type RecipeRow = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  categoryId: string;
  category: { name: string };
  recipeMaterials: {
    id: string;
    quantity: number;
    unit: string;
    material: { name: string };
  }[];
};

// Turns a stored recipe into the shape the library shows
function toRecipe(row: RecipeRow): Recipe {
  return {
    categoryId: row.categoryId,
    categoryName: row.category.name,
    recipeId: row.id,
    recipeName: row.name,
    recipeDescription: row.description ?? '',
    recipeUnit: row.unit,
    recipeMaterials: row.recipeMaterials.map((line) => ({
      id: line.id,
      name: line.material.name,
      quantity: line.quantity,
      unit: line.unit,
    })),
  };
}

// OWNERSHIP MODEL: userId owns all data; companyId is a tag on it. Every query
// is filtered by both, so a company's library only ever holds the caller's own
// recipes.
//
// "Archived" recipes stay in the table but are hidden from the library and from
// the category counts. Takeoff lines that use them keep working.
@Injectable()
export class RecipeLibraryRepository {
  // The company's categories, preceded by an "All" entry. Each carries the
  // number of live recipes in it; archived recipes aren't counted, so a count
  // always matches what the list shows.
  async getUserRecipeCategories(
    request: UserRecipeCategoriesRequest,
  ): Promise<UserRecipeCategoriesResponse> {
    const [company, categories] = await Promise.all([
      prisma.company.findFirst({
        where: { id: request.companyId, userId: request.userId },
        select: { name: true },
      }),
      prisma.category.findMany({
        where: { companyId: request.companyId, userId: request.userId },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          _count: { select: { recipes: { where: { isArchived: false } } } },
        },
      }),
    ]);

    const companyName = company?.name ?? '';
    const totalRecipeCount = categories.reduce(
      (sum, category) => sum + category._count.recipes,
      0,
    );

    return {
      companyId: request.companyId,
      companyName,
      categories: [
        {
          companyId: request.companyId,
          companyName,
          categoryId: ALL_CATEGORIES_ID,
          categoryName: 'All',
          numberOfRecipes: totalRecipeCount,
        },
        ...categories.map((category) => ({
          companyId: request.companyId,
          companyName,
          categoryId: category.id,
          categoryName: category.name,
          numberOfRecipes: category._count.recipes,
        })),
      ],
    };
  }

  // One page of recipes: live or archived, one category or all, optionally
  // matching a search term in the name or description (ignoring case).
  // The order is alphabetical with id as the tie-breaker, so paging is stable
  // and each recipe appears on exactly one page.
  async getRecipes(request: GetRecipesRequest): Promise<GetRecipesResponse> {
    const where = {
      companyId: request.companyId,
      userId: request.userId,
      isArchived: request.archived,
      ...(request.categoryId !== ALL_CATEGORIES_ID
        ? { categoryId: request.categoryId }
        : {}),
      ...(request.term
        ? {
            OR: [
              { name: { contains: request.term, mode: 'insensitive' as const } },
              {
                description: {
                  contains: request.term,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [rows, totalCount] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: (request.page - 1) * request.limit,
        take: request.limit,
        select: RECIPE_SELECT,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      totalCount,
      page: request.page,
      limit: request.limit,
      recipes: rows.map(toRecipe),
    };
  }

  // The recipe and the ids of its ingredient lines, or null if it isn't the
  // caller's (or doesn't exist).
  async findRecipe(
    companyId: string,
    userId: string,
    recipeId: string,
  ): Promise<{ id: string; ingredientIds: string[] } | null> {
    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId, companyId, userId },
      select: { id: true, recipeMaterials: { select: { id: true } } },
    });
    if (!recipe) return null;

    return {
      id: recipe.id,
      ingredientIds: recipe.recipeMaterials.map((line) => line.id),
    };
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
  // case), other than `excludeRecipeId` (the recipe being edited or restored).
  async recipeNameExists(
    companyId: string,
    userId: string,
    name: string,
    excludeRecipeId?: string,
  ): Promise<boolean> {
    const count = await prisma.recipe.count({
      where: {
        companyId,
        userId,
        isArchived: false,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeRecipeId ? { NOT: { id: excludeRecipeId } } : {}),
      },
    });
    return count > 0;
  }

  // Saves the edits together or not at all: the lines left out are removed,
  // the kept lines get their new quantities, and the recipe's own fields change.
  async updateRecipe(record: UpdateRecipeRecord): Promise<Recipe> {
    return await prisma.$transaction(async (tx) => {
      await tx.recipeMaterial.deleteMany({
        where: {
          recipeId: record.recipeId,
          id: { notIn: record.ingredients.map((line) => line.id) },
        },
      });

      for (const line of record.ingredients) {
        await tx.recipeMaterial.update({
          where: { id: line.id },
          data: { quantity: line.quantity },
        });
      }

      const row = await tx.recipe.update({
        where: { id: record.recipeId, companyId: record.companyId },
        data: {
          name: record.name,
          description: record.description,
          categoryId: record.categoryId,
        },
        select: RECIPE_SELECT,
      });

      return toRecipe(row);
    });
  }

  // Archives or restores the recipe. Returns false if it isn't the caller's.
  async setArchived(
    companyId: string,
    userId: string,
    recipeId: string,
    archived: boolean,
  ): Promise<ArchiveRecipeResponse | null> {
    const result = await prisma.recipe.updateMany({
      where: { id: recipeId, companyId, userId },
      data: { isArchived: archived },
    });
    if (result.count === 0) return null;

    return { recipeId, isArchived: archived };
  }

  // How many takeoff lines point at this recipe
  async countTakeoffLinesUsingRecipe(recipeId: string): Promise<number> {
    return await prisma.takeoffItem.count({ where: { recipeId } });
  }

  // Deletes the recipe. Its ingredient lines go with it. Only called once nothing uses it.
  async deleteRecipe(
    companyId: string,
    userId: string,
    recipeId: string,
  ): Promise<void> {
    await prisma.recipe.deleteMany({
      where: { id: recipeId, companyId, userId },
    });
  }
}