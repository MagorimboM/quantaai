import { Controller, Body, Get, Post, Put, Param, Query } from '@nestjs/common';
import { RecipeLibraryService } from '@/modules/recipeLibrary/recipeLibrary.service';

@Controller('recipe-library')
export class RecipeLibraryController {
  constructor(private readonly recipeLibraryService: RecipeLibraryService) {}

  @Get('/companies/:companyId/categories/:categoryId/recipes/search')
  async searchRecipe(
    @Param('companyId') companyId: string,
    @Param('categoryId') categoryId: string,
    @Query('term') term: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return await this.recipeLibraryService.searchRecipe({
      companyId: companyId,
      categoryId: categoryId,
      term: term,
      limit: limit,
      page: page,
    });
  }

  @Get('/companies/:companyId/categories')
  async getUserRecipeCategories(@Param('companyId') companyId: string) {
    return await this.recipeLibraryService.getUserRecipeCategories({
      companyId: companyId,
    });
  }

  @Get('/companies/:companyId/categories/:categoryId/recipes')
  async getCategoryRecipe(
    @Param('companyId') companyId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return await this.recipeLibraryService.getCategoryRecipe({
      categoryId: categoryId,
      companyId: companyId,
    });
  }
}