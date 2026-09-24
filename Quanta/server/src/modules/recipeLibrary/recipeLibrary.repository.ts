import { Injectable } from '@nestjs/common';
import type {
  SearchRecipeRequest,
  GetCategoryRecipeRequest,
  UserRecipeCategoriesRequest,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';
import { prisma } from '@/core/database/postgres';

const ALL_CATEGORIES_ID = 'all';

@Injectable()
export class RecipeLibraryRepository {
  async searchRecipe(request: SearchRecipeRequest) {
    const isAllCategories = request.categoryId === ALL_CATEGORIES_ID;

    const where = {
      companyId: request.companyId,
      ...(isAllCategories ? {} : { categoryId: request.categoryId }),
      OR: [
        { name: { contains: request.term, mode: 'insensitive' as const } },
        { description: { contains: request.term, mode: 'insensitive' as const } },
      ],
    };

    const [recipes, totalCount] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip: (request.page - 1) * request.limit,
        take: request.limit,
        select: {
          id: true,
          companyId: true,
          categoryId: true,
          name: true,
          description: true,
          category: { select: { name: true } },
          recipeMaterials: {
            select: {
              quantity: true,
              unit: true,
              material: { select: { name: true } },
            },
          },
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      totalCount,
      page: request.page,
      limit: request.limit,
      recipes: recipes.map((recipe) => ({
        companyId: recipe.companyId,
        categoryId: recipe.categoryId,
        categoryName: recipe.category.name,
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeDescription: recipe.description ?? '',
        recipeTags: [] as string[],
        recipeMaterials: recipe.recipeMaterials.map((rm) => ({
          name: rm.material.name,
          unitMeasureQuant: String(rm.quantity),
          unitMeasure: rm.unit,
        })),
      })),
    };
  }

  async getUserRecipeCategories(request: UserRecipeCategoriesRequest) {
    const categories = await prisma.category.findMany({
      where: { companyId: request.companyId },
      select: {
        id: true,
        name: true,
        companyId: true,
        company: { select: { name: true } },
        _count: { select: { recipes: true } },
      },
    });

    const totalRecipeCount = categories.reduce(
      (sum, category) => sum + category._count.recipes,
      0,
    );

    return {
      companyId: request.companyId,
      companyName: categories[0]?.company?.name ?? '',
      categories: [
        {
          companyId: request.companyId,
          companyName: categories[0]?.company?.name ?? '',
          categoryId: ALL_CATEGORIES_ID,
          categoryName: 'All',
          numberOfRecipes: totalRecipeCount,
        },
        ...categories.map((category) => ({
          companyId: category.companyId ?? request.companyId,
          companyName: category.company?.name ?? '',
          categoryId: category.id,
          categoryName: category.name,
          numberOfRecipes: category._count.recipes,
        })),
      ],
    };
  }

  async getCategoryRecipe(request: GetCategoryRecipeRequest) {
    const isAllCategories = request.categoryId === ALL_CATEGORIES_ID;

    const where = {
      companyId: request.companyId,
      ...(isAllCategories ? {} : { categoryId: request.categoryId }),
    };

    const [recipes, totalCount] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip: (request.page - 1) * request.limit,
        take: request.limit,
        select: {
          id: true,
          companyId: true,
          categoryId: true,
          name: true,
          description: true,
          category: { select: { name: true } },
          recipeMaterials: {
            select: {
              quantity: true,
              unit: true,
              material: { select: { name: true } },
            },
          },
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      totalCount,
      page: request.page,
      limit: request.limit,
      recipes: recipes.map((recipe) => ({
        companyId: recipe.companyId,
        categoryId: recipe.categoryId,
        categoryName: recipe.category.name,
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeDescription: recipe.description ?? '',
        recipeTags: [] as string[],
        recipeMaterials: recipe.recipeMaterials.map((rm) => ({
          name: rm.material.name,
          unitMeasureQuant: String(rm.quantity),
          unitMeasure: rm.unit,
        })),
      })),
    };
  }
}