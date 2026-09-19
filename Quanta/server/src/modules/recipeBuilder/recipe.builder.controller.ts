import { RecipeBuilderService } from '@/modules/recipeBuilder/recipe.builder.service';
import { Controller, Get, Post, Put, Delete, Body } from '@nestjs/common';
type NewRecipe = {
  companyId: string;
  categoryId: string;
  recipeName: string;
  recipeCode: string;
  recipeDescription: string;
  recipeUnitMeasure: string;
  ingredients: {
    materialId: string;
    unitMeasureId: string;
    quantity: string;
  }[];
};

// TODO :: FETCH USER ID FROM THE HEADERS/COOKIES OR VALIDATED STUFF.

@Controller('recipe/new-recipe')
export class RecipeBuilderController {
  constructor(private readonly recipeBuilderService: RecipeBuilderService) {}

  @Post('')
  async createNewRecipe(@Body() request: NewRecipe) {
    const userId = 'seed-user-100';
    return await this.recipeBuilderService.createNewRecipe(userId, request);
  }
}
