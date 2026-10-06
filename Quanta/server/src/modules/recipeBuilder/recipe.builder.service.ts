import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { RecipeBuilderRepository } from '@/modules/recipeBuilder/recipe.builder.repository';
import { AccessService } from '@/auth/services/access.service';
import type {
  CreateRecipeRequest,
  SearchMaterialsRequest,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.request.contracts';
import type {
  Category,
  SiteCondition,
  MaterialSearchResult,
  CreateRecipeResponse,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts';

// Every method first checks the company really belongs to the caller. The
// company id comes from the URL, so on its own it proves nothing.
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

  async getListOfSiteConditions(request: {
    clerkId: string;
    companyId: string;
  }): Promise<SiteCondition[]> {
    await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.recipeBuilderRepository.getListOfSiteConditions();
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
      term: request.filters.term?.trim() || undefined,
      categoryId: request.filters.categoryId || undefined,
      siteConditionId: request.filters.siteConditionId || undefined,
    });
  }

  /**
   * Checks a new recipe, then saves it.
   *
   * A recipe is a name, a type (category), the unit its quantities are per, and
   * at least one ingredient with a quantity above zero. Everything it points at
   * must really be the caller's: the category, and every material. The recipe
   * name must be new for the company, ignoring case.
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

    const name = recipe.name?.trim();
    const unit = recipe.unit?.trim();
    if (!name) throw new BadRequestException('Give the recipe a name');
    if (!unit) throw new BadRequestException('Say what the quantities are per');
    if (typeof recipe.categoryId !== 'string' || !recipe.categoryId) {
      throw new BadRequestException('Choose a recipe type');
    }
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      throw new BadRequestException('A recipe needs at least one ingredient');
    }

    // Each ingredient needs a real quantity above zero, and may appear only once
    const materialIds = new Set<string>();
    for (const ingredient of recipe.ingredients) {
      if (
        typeof ingredient?.materialId !== 'string' ||
        !Number.isFinite(ingredient.quantity) ||
        ingredient.quantity <= 0
      ) {
        throw new BadRequestException(
          'Every ingredient needs a quantity above zero',
        );
      }
      if (materialIds.has(ingredient.materialId)) {
        throw new BadRequestException(
          'Each ingredient can only be added once',
        );
      }
      materialIds.add(ingredient.materialId);
    }

    const categoryOk = await this.recipeBuilderRepository.categoryExists(
      companyId,
      userId,
      recipe.categoryId,
    );
    if (!categoryOk) throw new BadRequestException('Unknown recipe type');

    const siteConditionId = recipe.siteConditionId || null;
    if (
      siteConditionId &&
      !(await this.recipeBuilderRepository.siteConditionExists(siteConditionId))
    ) {
      throw new BadRequestException('Unknown site condition');
    }

    // Every ingredient must be one of the caller's own materials. Each line's
    // unit is taken from its material, not from the client.
    const materials = await this.recipeBuilderRepository.findOwnedMaterials(
      companyId,
      userId,
      [...materialIds],
    );
    if (materials.length !== materialIds.size) {
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
        name,
      )
    ) {
      throw new ConflictException('A recipe with this name already exists');
    }

    return await this.recipeBuilderRepository.createNewRecipe({
      companyId,
      userId,
      categoryId: recipe.categoryId,
      siteConditionId,
      name,
      description: recipe.description?.trim() || null,
      unit,
      ingredients: recipe.ingredients.map((ingredient) => ({
        materialId: ingredient.materialId,
        quantity: ingredient.quantity,
        unit: unitByMaterialId.get(ingredient.materialId) as string,
      })),
    });
  }
}