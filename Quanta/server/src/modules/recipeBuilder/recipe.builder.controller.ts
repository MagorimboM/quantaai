import { RecipeBuilderService } from '@/modules/recipeBuilder/recipe.builder.service';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

type NewRecipe = {
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

@Controller(':companyId/recipe/new-recipe')
export class RecipeBuilderController {
  constructor(private readonly recipeBuilderService: RecipeBuilderService) {}

  @Post('')
  async createNewRecipe(
    @Body() request: NewRecipe,
    @Param('companyId') companyId: string,
  ) {
    // TODO:: get userId  from headers
    const userId = 'seed-user-100';
    return await this.recipeBuilderService.createNewRecipe(
      companyId,
      userId,
      request,
    );
  }

  @Get('recipe_categories')
  async getListOfCategories(@Param('companyId') companyId: string) {
    // TODO:: get userId from headers
    const userId = 'seed-user-001';
    return await this.recipeBuilderService.getListOfCategories(
      companyId,
      userId,
    );
  }

  @Get('/:query/:categoryId/materials_and_categories')
  async getListOfMaterialsAndCategories(
    @Param('companyId') companyId: string,
    @Param('categoryId') categoryId: string,
    @Param('query') query: string,
  ) {
    // TODO:: get userId from headers
    const userId = 'seed-user-001';
    return await this.recipeBuilderService.getListOfMaterialsAndCategories(
      companyId,
      categoryId,
      userId,
      query,
    );
  }

  @Get('material_category')
  async materialCategories(@Param('companyId') companyId: string) {
    const userId = 'seed-user-001';

    return await this.recipeBuilderService.materialCategories(
      userId,
      companyId,
    );
  }
}
