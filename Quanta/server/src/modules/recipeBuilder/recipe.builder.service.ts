import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { RecipeBuilderRepository } from '@/modules/recipeBuilder/recipe.builder.repository';
import { AccessService } from '@/auth/services/access.service';
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

// Every method first checks the company really belongs to the caller. The
// company id comes from the URL, so on its own it proves nothing.
//
// The shape of every request (names present and tidied, quantities above zero,
// no repeated ingredients or classes, at least one building class) has already
// been checked by the Zod schemas in recipeBuilder.schema.ts before a method
// runs. What's left here are the checks that need the database: that
// everything a request points at is really the caller's, and that names are new.
@Injectable()
export class RecipeBuilderService {
  constructor(
    private readonly recipeBuilderRepository: RecipeBuilderRepository,
    private readonly accessService: AccessService,
  ) {}

  async getListOfCategories(request: {
    clerkId: string;
    companyId: string;
  }): Promise<Category[]> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.recipeBuilderRepository.getListOfCategories(
      request.companyId,
      userId,
    );
  }

  // The building classes a recipe can be marked as suiting
  async getListOfBuildingClasses(request: {
    clerkId: string;
    companyId: string;
  }): Promise<BuildingClassOption[]> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.recipeBuilderRepository.getListOfBuildingClasses(userId);
  }

  // The site classes a recipe can be marked as suiting
  async getListOfSiteClasses(request: {
    clerkId: string;
    companyId: string;
  }): Promise<SiteClassOption[]> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.recipeBuilderRepository.getListOfSiteClasses(userId);
  }

  // Adds a site class the user was missing. Its name must be new among their
  // site classes (ignoring case).
  async createSiteClass(request: {
    clerkId: string;
    companyId: string;
    siteClass: CreateSiteClassRequest;
  }): Promise<SiteClassOption> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const { name, description } = request.siteClass;

    if (await this.recipeBuilderRepository.siteClassNameExists(userId, name)) {
      throw new ConflictException('A site class with this name already exists');
    }

    return await this.recipeBuilderRepository.createSiteClass({
      userId,
      name,
      description,
    });
  }

  async searchMaterials(request: {
    clerkId: string;
    companyId: string;
    filters: SearchMaterialsRequest;
  }): Promise<MaterialSearchResult[]> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.recipeBuilderRepository.searchMaterials({
      companyId: request.companyId,
      userId,
      term: request.filters.term,
      categoryId: request.filters.categoryId,
    });
  }

  /**
   * Saves a new recipe once everything it points at has been checked as the
   * caller's: the category, every material and every class. The recipe name must
   * be new for the company, ignoring case. Each ingredient's unit is taken from
   * its material, not from the client.
   */
  async createNewRecipe(request: {
    clerkId: string;
    companyId: string;
    recipe: CreateRecipeRequest;
  }): Promise<CreateRecipeResponse> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const { recipe, companyId } = request;

    const categoryOk = await this.recipeBuilderRepository.categoryExists(
      companyId,
      userId,
      recipe.categoryId,
    );
    if (!categoryOk) throw new BadRequestException('Unknown recipe type');

    const ownBuildingClasses =
      await this.recipeBuilderRepository.countOwnedBuildingClasses(
        userId,
        recipe.buildingClassIds,
      );
    if (ownBuildingClasses !== recipe.buildingClassIds.length) {
      throw new BadRequestException('Unknown building class');
    }
    const ownSiteClasses = await this.recipeBuilderRepository.countOwnedSiteClasses(
      userId,
      recipe.siteClassIds,
    );
    if (ownSiteClasses !== recipe.siteClassIds.length) {
      throw new BadRequestException('Unknown site class');
    }

    // Every ingredient must be one of the caller's own materials
    const materialIds = recipe.ingredients.map((ingredient) => ingredient.materialId);
    const materials = await this.recipeBuilderRepository.findOwnedMaterials(
      companyId,
      userId,
      materialIds,
    );
    if (materials.length !== materialIds.length) {
      throw new BadRequestException(
        'One or more ingredients are not in your materials',
      );
    }
    const unitByMaterialId = new Map(
      materials.map((material) => [material.id, material.unit]),
    );

    if (
      await this.recipeBuilderRepository.recipeNameExists(
        companyId,
        userId,
        recipe.name,
      )
    ) {
      throw new ConflictException('A recipe with this name already exists');
    }

    return await this.recipeBuilderRepository.createNewRecipe({
      companyId,
      userId,
      categoryId: recipe.categoryId,
      name: recipe.name,
      description: recipe.description ?? null,
      unit: recipe.unit,
      ingredients: recipe.ingredients.map((ingredient) => ({
        materialId: ingredient.materialId,
        quantity: ingredient.quantity,
        unit: unitByMaterialId.get(ingredient.materialId) as string,
      })),
      buildingClassIds: recipe.buildingClassIds,
      siteClassIds: recipe.siteClassIds,
    });
  }

  async searchRecipeCategory(term: string, clerkId: string) {
    return await this.recipeBuilderRepository.searchRecipeCategory(term, clerkId);
  }
}