import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { RecipeLibraryService } from '@/modules/recipeLibrary/recipeLibrary.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import { ZodValidationPipe } from '@/common/validations/global.input.validator';
import {
  archiveRecipeSchema,
  createBuildingClassSchema,
  createCatalogueItemSchema,
  createCategorySchema,
  createRecipeSchema,
  createSiteClassSchema,
  getRecipesQuerySchema,
  recipeCategoriesQuerySchema,
  updateRecipeSchema,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.schema';
import type {
  UpdateRecipeRequest,
  ArchiveRecipeBody,
  CreateRecipeInput,
  CreateCategoryInput,
  CreateCatalogueItemInput,
  CreateSiteClassInput,
  CreateBuildingClassInput,
  RecipeCategoriesQuery,
  GetRecipesQuery,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';
import type {
  Recipe,
  UserRecipeCategoriesResponse,
  GetRecipesResponse,
  GetRecipeClassificationsResponse,
  ArchiveRecipeResponse,
  DeleteRecipeResponse,
  GetRecipeCatalogueResponse,
  CreateCategoryResponse,
  CreateCatalogueItemResponse,
  CreateSiteClassResponse,
  CreateBuildingClassResponse,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts';

// The company's recipe library. Every route runs behind the global
// ClerkAuthGuard, so @ClerkUserId() is the verified caller; the service checks
// the company in the URL is really theirs.
//
// Every body and query is checked and tidied by the schemas in
// recipeLibrary.schema.ts first: a bad one gets a 400 and never reaches the
// service.
@Controller(':companyId/recipe-library')
export class RecipeLibraryController {
  constructor(private readonly recipeLibraryService: RecipeLibraryService) {}

  // The user's site classes and building classes, for the two selectors at the
  // top of the library, each with the company's live recipe count
  @Get('classifications')
  async getRecipeClassifications(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<GetRecipeClassificationsResponse> {
    return await this.recipeLibraryService.getRecipeClassifications({
      clerkId,
      companyId,
    });
  }

  // Adds a site class from the Create recipe form   body: { name, description }
  // Refused (409) if the user already has one with that name.
  @Post('site-classes')
  async createSiteClass(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createSiteClassSchema)) body: CreateSiteClassInput,
  ): Promise<CreateSiteClassResponse> {
    return await this.recipeLibraryService.createSiteClass({
      clerkId,
      companyId,
      siteClass: body,
    });
  }

  // Adds a building class from the Create recipe form   body: { name, description }
  // Refused (409) if the user already has one with that name.
  @Post('building-classes')
  async createBuildingClass(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createBuildingClassSchema))
    body: CreateBuildingClassInput,
  ): Promise<CreateBuildingClassResponse> {
    return await this.recipeLibraryService.createBuildingClass({
      clerkId,
      companyId,
      buildingClass: body,
    });
  }

  // The company's categories, preceded by "All", each with its recipe count
  // for the chosen classes.
  // ?buildingClassId=<id or all>&siteClassId=<id or all>
  @Get('categories')
  async getUserRecipeCategories(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query(new ZodValidationPipe(recipeCategoriesQuerySchema))
    query: RecipeCategoriesQuery,
  ): Promise<UserRecipeCategoriesResponse> {
    return await this.recipeLibraryService.getUserRecipeCategories({
      clerkId,
      companyId,
      buildingClassId: query.buildingClassId,
      siteClassId: query.siteClassId,
    });
  }

  // One page of recipes.
  // ?categoryId=<id or all>&buildingClassId=<id or all>&siteClassId=<id or all>
  //  &term=brick&archived=true&page=1&limit=10
  @Get('recipes')
  async getRecipes(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query(new ZodValidationPipe(getRecipesQuerySchema)) query: GetRecipesQuery,
  ): Promise<GetRecipesResponse> {
    return await this.recipeLibraryService.getRecipes({
      clerkId,
      companyId,
      categoryId: query.categoryId,
      buildingClassId: query.buildingClassId,
      siteClassId: query.siteClassId,
      term: query.term,
      archived: query.archived,
      page: query.page,
      limit: query.limit,
    });
  }

  // Saves an edited recipe and returns it
  @Patch('recipes/:recipeId')
  async updateRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('recipeId') recipeId: string,
    @Body(new ZodValidationPipe(updateRecipeSchema)) body: UpdateRecipeRequest,
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
    @Body(new ZodValidationPipe(archiveRecipeSchema)) body: ArchiveRecipeBody,
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
    @Body(new ZodValidationPipe(createCatalogueItemSchema))
    body: CreateCatalogueItemInput,
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
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput,
  ): Promise<CreateCategoryResponse> {
    return await this.recipeLibraryService.createCategory({
      clerkId,
      companyId,
      category: body,
    });
  }

  // Creates a recipe with its components and returns it as the library shows it
  //   body: { name, categoryId, unit, description, materials, labour, overheads,
  //           buildingClassIds?, siteClassIds? }
  @Post('recipes')
  async createRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createRecipeSchema)) body: CreateRecipeInput,
  ): Promise<Recipe> {
    return await this.recipeLibraryService.createRecipe({
      clerkId,
      companyId,
      recipe: body,
    });
  }
}