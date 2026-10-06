import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RecipeBuilderService } from '@/modules/recipeBuilder/recipe.builder.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import type { CreateRecipeRequest } from '@/modules/recipeBuilder/contracts/recipeBuilder.request.contracts';
import type {
  Category,
  SiteCondition,
  MaterialSearchResult,
  CreateRecipeResponse,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts';

// Everything the recipe builder form needs. Every route runs behind the global
// ClerkAuthGuard, so @ClerkUserId() is the verified caller; the service checks
// the company in the URL is really theirs.
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

  // The ground conditions a recipe can be tagged with
  @Get('site-conditions')
  async getListOfSiteConditions(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<SiteCondition[]> {
    return await this.recipeBuilderService.getListOfSiteConditions({
      clerkId,
      companyId,
    });
  }

  // The company's materials, filtered: ?term=brick&categoryId=...&siteConditionId=...
  @Get('materials')
  async searchMaterials(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query('term') term?: string,
    @Query('categoryId') categoryId?: string,
    @Query('siteConditionId') siteConditionId?: string,
  ): Promise<MaterialSearchResult[]> {
    return await this.recipeBuilderService.searchMaterials({
      clerkId,
      companyId,
      filters: { term, categoryId, siteConditionId },
    });
  }

  // Creates a recipe with its ingredients
  @Post()
  async createNewRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body() recipe: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    return await this.recipeBuilderService.createNewRecipe({
      clerkId,
      companyId,
      recipe,
    });
  }
}