import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RecipeBuilderService } from '@/modules/recipeBuilder/recipe.builder.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import { ZodValidationPipe } from '@/common/validations/global.input.validator';
import {
  createRecipeSchema,
  createSiteClassSchema,
  searchMaterialsQuerySchema,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.schema';
import type {
  CreateRecipeRequest,
  CreateSiteClassRequest,
  SearchMaterialsRequest,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.request.contracts';
import type {
  Category,
  SiteClassOption,
  BuildingClassOption,
  MaterialSearchResult,
  CreateRecipeResponse,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts';

// Everything the recipe builder form needs. Every route runs behind the global
// ClerkAuthGuard, so @ClerkUserId() is the verified caller; the service checks
// the company in the URL is really theirs.
//
// Every body and query is checked and tidied by the schemas in
// recipeBuilder.schema.ts first: a bad one gets a 400 and never reaches the
// service.
@Controller(':companyId/recipe/new-recipe')
export class RecipeBuilderController {
  constructor(private readonly recipeBuilderService: RecipeBuilderService) {}

  // The company's categories: the recipe types, and the groups materials sit in
  @Get('categories')
  async getListOfCategories(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<Category[]> {
    return await this.recipeBuilderService.getListOfCategories({
      clerkId,
      companyId,
    });
  }

  // The building classes a recipe can suit
  @Get('building-classes')
  async getListOfBuildingClasses(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<BuildingClassOption[]> {
    return await this.recipeBuilderService.getListOfBuildingClasses({
      clerkId,
      companyId,
    });
  }

  // The site classes a recipe can suit, in AS 2870 order
  @Get('site-classes')
  async getListOfSiteClasses(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<SiteClassOption[]> {
    return await this.recipeBuilderService.getListOfSiteClasses({
      clerkId,
      companyId,
    });
  }

  // Adds a site class   body: { name, description }
  // Refused (409) if the user already has one with that name.
  @Post('site-classes')
  async createSiteClass(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createSiteClassSchema))
    siteClass: CreateSiteClassRequest,
  ): Promise<SiteClassOption> {
    return await this.recipeBuilderService.createSiteClass({
      clerkId,
      companyId,
      siteClass,
    });
  }

  // The company's materials, filtered: ?term=brick&categoryId=...
  @Get('materials')
  async searchMaterials(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query(new ZodValidationPipe(searchMaterialsQuerySchema))
    filters: SearchMaterialsRequest,
  ): Promise<MaterialSearchResult[]> {
    return await this.recipeBuilderService.searchMaterials({
      clerkId,
      companyId,
      filters,
    });
  }

  // Creates a recipe with its ingredients and the classes it suits
  //   body: { name, categoryId, unit, description, ingredients,
  //           buildingClassIds, siteClassIds }
  @Post()
  async createNewRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createRecipeSchema)) recipe: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    return await this.recipeBuilderService.createNewRecipe({
      clerkId,
      companyId,
      recipe,
    });
  }

  @Get('category/:query')
  async searchRecipeCategory(
    @ClerkUserId() clerkId: string,
    @Param('query') term: string,
  ) {
    return await this.recipeBuilderService.searchRecipeCategory(term, clerkId);
  }
}