import { Injectable } from '@nestjs/common';
import type {
  SearchRecipeRequest,
  GetCategoryRecipeRequest,
  UserRecipeCategoriesRequest,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';
import { prisma } from '@/core/database/postgres';

@Injectable()
export class RecipeLibraryRepository {
  async searchRecipe(request: SearchRecipeRequest) {
    const recipes = await prisma.recipe.findMany({
      where: {
        companyId: request.companyId,
        categoryId: request.categoryId,
        OR: [
          { name: { contains: request.term, mode: 'insensitive' } },
          { description: { contains: request.term, mode: 'insensitive' } },
        ],
      },
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
    });

    return recipes.map((recipe) => ({
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
    }));
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

    return {
      companyId: request.companyId,
      companyName: categories[0]?.company?.name ?? '',
      categories: categories.map((category) => ({
        companyId: category.companyId ?? request.companyId,
        companyName: category.company?.name ?? '',
        categoryId: category.id,
        categoryName: category.name,
        numberOfRecipes: category._count.recipes,
      })),
    };
  }

  async getCategoryRecipe(request: GetCategoryRecipeRequest) {
    const recipes = await prisma.recipe.findMany({
      where: {
        companyId: request.companyId,
        categoryId: request.categoryId,
      },
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
    });

    return recipes.map((recipe) => ({
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
    }));
  }
}