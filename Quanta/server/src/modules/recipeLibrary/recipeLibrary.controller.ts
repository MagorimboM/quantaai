import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RecipeLibraryService } from '@/modules/recipeLibrary/recipeLibrary.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import type {
  UpdateRecipeRequest,
  ArchiveRecipeBody,
  CreateRecipeInput,
  CreateCategoryInput,
  CreateCatalogueItemInput,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';
import type {
  Recipe,
  UserRecipeCategoriesResponse,
  GetRecipesResponse,
  ArchiveRecipeResponse,
  DeleteRecipeResponse,
  GetRecipeCatalogueResponse,
  CreateCategoryResponse,
  CreateCatalogueItemResponse,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts';

// The company's recipe library. Every route runs behind the global
// ClerkAuthGuard, so @ClerkUserId() is the verified caller; the service checks
// the company in the URL is really theirs.
@Controller(':companyId/recipe-library')
export class RecipeLibraryController {
  constructor(private readonly recipeLibraryService: RecipeLibraryService) {}

  // The company's categories, preceded by "All", each with its recipe count
  @Get('categories')
  async getUserRecipeCategories(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<UserRecipeCategoriesResponse> {
    return await this.recipeLibraryService.getUserRecipeCategories({
      clerkId,
      companyId,
    });
  }

  // One page of recipes.
  // ?categoryId=<id or all>&term=brick&archived=true&page=1&limit=10
  @Get('recipes')
  async getRecipes(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query('categoryId') categoryId: string = 'all',
    @Query('term') term?: string,
    @Query('archived') archived?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<GetRecipesResponse> {
    return await this.recipeLibraryService.getRecipes({
      clerkId,
      companyId,
      categoryId,
      term,
      archived: archived === 'true',
      page,
      limit,
    });
  }

  // Saves an edited recipe and returns it
  @Patch('recipes/:recipeId')
  async updateRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('recipeId') recipeId: string,
    @Body() body: UpdateRecipeRequest,
  ): Promise<Recipe> {
    return await this.recipeLibraryService.updateRecipe({
      clerkId,
      companyId,
      recipeId,
      body,
    });
  }

  // Archives a recipe, or restores it   body: { archived: boolean }
  @Patch('recipes/:recipeId/archive')
  async archiveRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('recipeId') recipeId: string,
    @Body() body: ArchiveRecipeBody,
  ): Promise<ArchiveRecipeResponse> {
    return await this.recipeLibraryService.archiveRecipe({
      clerkId,
      companyId,
      recipeId,
      archived: body.archived,
    });
  }

  // Deletes a recipe for good. Refused (409) if a takeoff still uses it.
  @Delete('recipes/:recipeId')
  async deleteRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('recipeId') recipeId: string,
  ): Promise<DeleteRecipeResponse> {
    return await this.recipeLibraryService.deleteRecipe({
      clerkId,
      companyId,
      recipeId,
    });
  }

  @Get('catalogue')
  async getRecipeCatalogue(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<GetRecipeCatalogueResponse> {
    return await this.recipeLibraryService.getRecipeCatalogue({
      clerkId,
      companyId,
    });
  }

  // Adds a material, labour or overhead that was missing from the catalogue
  //   body: { kind, name, unit, categoryId, labourType }
  @Post('catalogue-items')
  async createCatalogueItem(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body() body: CreateCatalogueItemInput,
  ): Promise<CreateCatalogueItemResponse> {
    return await this.recipeLibraryService.createCatalogueItem({
      clerkId,
      companyId,
      item: body,
    });
  }

  // Adds a category   body: { name }
  @Post('categories')
  async createCategory(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body() body: CreateCategoryInput,
  ): Promise<CreateCategoryResponse> {
    return await this.recipeLibraryService.createCategory({
      clerkId,
      companyId,
      category: body,
    });
  }

  // Creates a recipe with its components and returns it as the library shows it
  //   body: { name, categoryId, unit, description, materials, labour, overheads }
  @Post('recipes')
  async createRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body() body: CreateRecipeInput,
  ): Promise<Recipe> {
    return await this.recipeLibraryService.createRecipe({
      clerkId,
      companyId,
      recipe: body,
    });
  }
}
