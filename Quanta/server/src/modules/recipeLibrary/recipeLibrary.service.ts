import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecipeLibraryRepository } from '@/modules/recipeLibrary/recipeLibrary.repository';
import { AccessService } from '@/auth/services/access.service';
import type {
  UpdateRecipeRequest,
  CreateCatalogueItemInput,
  CreateCategoryInput,
  CreateRecipeInput,
  RecipeComponentInput,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';
import type {
  Recipe,
  UserRecipeCategoriesResponse,
  GetRecipesResponse,
  ArchiveRecipeResponse,
  DeleteRecipeResponse,
  GetRecipeCatalogueResponse,
  CreateCatalogueItemResponse,
  CreateCategoryResponse,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts';

// The most recipes one request may return, however large a limit is asked for
const MAX_PAGE_SIZE = 50;

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

// TODO :: [backend] The checks below (and the matching ones in
// quantityTakeOffs/qto.service.ts, which also creates recipes) say the same
// thing twice. Move them to one shared file once both are settled.

// A catalogue item needs a name, the unit it is counted in and a category.
// Labour also has a type; the other kinds don't.
function assertValidCatalogueItem(item: CreateCatalogueItemInput) {
  if (!['material', 'labour', 'overhead'].includes(item?.kind)) {
    throw new BadRequestException('The kind must be material, labour or overhead');
  }
  if (!isNonEmptyText(item.name)) {
    throw new BadRequestException('A name is required');
  }
  if (!isNonEmptyText(item.unit)) {
    throw new BadRequestException('A unit is required');
  }
  if (!isNonEmptyText(item.categoryId)) {
    throw new BadRequestException('A category is required');
  }
  if (item.kind === 'labour' && !isNonEmptyText(item.labourType)) {
    throw new BadRequestException('A labour type is required');
  }
}

// Each component needs a real quantity above zero, and the same item can't be
// listed twice in one section (it would be two rows for one thing).
function assertValidComponents(components: RecipeComponentInput[], label: string) {
  if (!Array.isArray(components)) {
    throw new BadRequestException(`Expected a list of ${label}`);
  }
  const seen = new Set<string>();
  for (const component of components) {
    if (!isNonEmptyText(component?.itemId)) {
      throw new BadRequestException(`A ${label} entry has no item`);
    }
    if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
      throw new BadRequestException(`Every ${label} quantity must be above zero`);
    }
    if (seen.has(component.itemId)) {
      throw new BadRequestException(`A ${label} item is listed twice`);
    }
    seen.add(component.itemId);
  }
}

// A recipe is only useful with a name, a category, the unit it is priced per
// and at least one thing it is made of.
function assertValidNewRecipe(recipe: CreateRecipeInput) {
  if (!isNonEmptyText(recipe?.name)) {
    throw new BadRequestException('Give the recipe a name');
  }
  if (!isNonEmptyText(recipe.categoryId)) {
    throw new BadRequestException('Choose a category');
  }
  if (!isNonEmptyText(recipe.unit)) {
    throw new BadRequestException('A unit is required');
  }
  if (recipe.description !== null && typeof recipe.description !== 'string') {
    throw new BadRequestException('The description must be text or empty');
  }
  assertValidComponents(recipe.materials, 'material');
  assertValidComponents(recipe.labour, 'labour');
  assertValidComponents(recipe.overheads, 'overhead');
  if (
    recipe.materials.length + recipe.labour.length + recipe.overheads.length ===
    0
  ) {
    throw new BadRequestException('A recipe needs at least one component');
  }
}

// Every method first checks the company really belongs to the caller. The
// company id comes from the URL, so on its own it proves nothing.
@Injectable()
export class RecipeLibraryService {
  constructor(
    private readonly recipeLibraryRepository: RecipeLibraryRepository,
    private readonly accessService: AccessService,
  ) {}

  async getUserRecipeCategories(request: {
    clerkId: string;
    companyId: string;
  }): Promise<UserRecipeCategoriesResponse> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.recipeLibraryRepository.getUserRecipeCategories({
      companyId: request.companyId,
      userId,
    });
  }

  async getRecipeCatalogue(request: {
    clerkId: string;
    companyId: string;
  }): Promise<GetRecipeCatalogueResponse> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.recipeLibraryRepository.getRecipeCatalogue({
      companyId: request.companyId,
      userId,
    });
  }

  // The new item is filed under one of the company's own categories
  async createCatalogueItem(request: {
    clerkId: string;
    companyId: string;
    item: CreateCatalogueItemInput;
  }): Promise<CreateCatalogueItemResponse> {
    assertValidCatalogueItem(request.item);
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );

    const categoryOk = await this.recipeLibraryRepository.categoryExists(
      request.companyId,
      userId,
      request.item.categoryId,
    );
    if (!categoryOk) throw new BadRequestException('Unknown category');

    return await this.recipeLibraryRepository.createCatalogueItem({
      companyId: request.companyId,
      userId,
      kind: request.item.kind,
      name: request.item.name.trim(),
      unit: request.item.unit.trim(),
      categoryId: request.item.categoryId,
      labourType:
        request.item.kind === 'labour' ? request.item.labourType!.trim() : null,
    });
  }

  // Two categories with the same name would look identical in the library's list
  async createCategory(request: {
    clerkId: string;
    companyId: string;
    category: CreateCategoryInput;
  }): Promise<CreateCategoryResponse> {
    if (!isNonEmptyText(request.category?.name)) {
      throw new BadRequestException('A name is required');
    }
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const name = request.category.name.trim();

    if (
      await this.recipeLibraryRepository.categoryNameExists(
        request.companyId,
        userId,
        name,
      )
    ) {
      throw new ConflictException('A category with this name already exists');
    }

    return await this.recipeLibraryRepository.createCategory({
      companyId: request.companyId,
      userId,
      name,
    });
  }

  // Creates a recipe. Like an edit, it needs a name that no other live recipe in
  // the company uses (ignoring case) and one of the company's categories.
  async createRecipe(request: {
    clerkId: string;
    companyId: string;
    recipe: CreateRecipeInput;
  }): Promise<Recipe> {
    assertValidNewRecipe(request.recipe);
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const { recipe, companyId } = request;
    const name = recipe.name.trim();

    const categoryOk = await this.recipeLibraryRepository.categoryExists(
      companyId,
      userId,
      recipe.categoryId,
    );
    if (!categoryOk) throw new BadRequestException('Unknown category');

    if (
      await this.recipeLibraryRepository.recipeNameExists(companyId, userId, name)
    ) {
      throw new ConflictException('A recipe with this name already exists');
    }

    return await this.recipeLibraryRepository.createRecipe({
      companyId,
      userId,
      name,
      categoryId: recipe.categoryId,
      unit: recipe.unit.trim(),
      description: recipe.description?.trim() || null,
      materials: recipe.materials,
      labour: recipe.labour,
      overheads: recipe.overheads,
    });
  }

  async getRecipes(request: {
    clerkId: string;
    companyId: string;
    categoryId: string;
    term?: string;
    archived: boolean;
    page: number;
    limit: number;
  }): Promise<GetRecipesResponse> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );

    // Keep paging in a safe range: a page below 1 would ask the database to skip
    // a negative number of rows, and a huge limit would return everything at once.
    const page = Math.max(request.page, 1);
    const limit = Math.min(Math.max(request.limit, 1), MAX_PAGE_SIZE);

    return await this.recipeLibraryRepository.getRecipes({
      companyId: request.companyId,
      userId,
      categoryId: request.categoryId,
      term: request.term?.trim() || undefined,
      archived: request.archived,
      page,
      limit,
    });
  }

  /**
   * Saves an edited recipe. It needs a name that no other live recipe in the
   * company uses (ignoring case), one of the company's categories, and at least
   * one ingredient line. Lines can only be kept or removed, never added or
   * pointed at another recipe: every id sent must be one of this recipe's own
   * lines, each with a quantity above zero.
   */
  async updateRecipe(request: {
    clerkId: string;
    companyId: string;
    recipeId: string;
    body: UpdateRecipeRequest;
  }): Promise<Recipe> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const { body, companyId, recipeId } = request;

    const recipe = await this.recipeLibraryRepository.findRecipe(
      companyId,
      userId,
      recipeId,
    );
    if (!recipe) throw new NotFoundException('Recipe not found');

    const name = body.name?.trim();
    if (!name) throw new BadRequestException('Give the recipe a name');
    if (typeof body.categoryId !== 'string' || !body.categoryId) {
      throw new BadRequestException('Choose a category');
    }
    if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      throw new BadRequestException('A recipe needs at least one material');
    }

    const ownLineIds = new Set(recipe.ingredientIds);
    const keptIds = new Set<string>();
    for (const line of body.ingredients) {
      if (
        typeof line?.id !== 'string' ||
        !Number.isFinite(line.quantity) ||
        line.quantity <= 0
      ) {
        throw new BadRequestException(
          'Every material needs a quantity above zero',
        );
      }
      if (!ownLineIds.has(line.id)) {
        throw new BadRequestException('That material is not part of this recipe');
      }
      if (keptIds.has(line.id)) {
        throw new BadRequestException('A material can only appear once');
      }
      keptIds.add(line.id);
    }

    const categoryOk = await this.recipeLibraryRepository.categoryExists(
      companyId,
      userId,
      body.categoryId,
    );
    if (!categoryOk) throw new BadRequestException('Unknown category');

    if (
      await this.recipeLibraryRepository.recipeNameExists(
        companyId,
        userId,
        name,
        recipeId,
      )
    ) {
      throw new ConflictException('A recipe with this name already exists');
    }

    return await this.recipeLibraryRepository.updateRecipe({
      companyId,
      userId,
      recipeId,
      name,
      description: body.description?.trim() || null,
      categoryId: body.categoryId,
      ingredients: body.ingredients,
    });
  }

  // Archives a recipe (hides it) or restores it. A restored recipe becomes live
  // again, so its name must not clash with another live recipe.
  async archiveRecipe(request: {
    clerkId: string;
    companyId: string;
    recipeId: string;
    archived: boolean;
  }): Promise<ArchiveRecipeResponse> {
    if (typeof request.archived !== 'boolean') {
      throw new BadRequestException('"archived" must be true or false');
    }
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );

    if (!request.archived) {
      const recipe = await this.recipeLibraryRepository.findRecipe(
        request.companyId,
        userId,
        request.recipeId,
      );
      if (!recipe) throw new NotFoundException('Recipe not found');
    }

    const result = await this.recipeLibraryRepository.setArchived(
      request.companyId,
      userId,
      request.recipeId,
      request.archived,
    );
    if (!result) throw new NotFoundException('Recipe not found');
    return result;
  }

  // Deletes a recipe for good, but only if no takeoff line uses it. Deleting a
  // used recipe would strip the recipe from those lines, quietly changing
  // projects (completed ones too), so it is refused and archiving is suggested.
  async deleteRecipe(request: {
    clerkId: string;
    companyId: string;
    recipeId: string;
  }): Promise<DeleteRecipeResponse> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );

    const recipe = await this.recipeLibraryRepository.findRecipe(
      request.companyId,
      userId,
      request.recipeId,
    );
    if (!recipe) throw new NotFoundException('Recipe not found');

    const linesUsingIt =
      await this.recipeLibraryRepository.countTakeoffLinesUsingRecipe(
        request.recipeId,
      );
    if (linesUsingIt > 0) {
      throw new ConflictException(
        `This recipe is used by ${linesUsingIt} takeoff line${linesUsingIt === 1 ? '' : 's'}. Archive it instead.`,
      );
    }

    await this.recipeLibraryRepository.deleteRecipe(
      request.companyId,
      userId,
      request.recipeId,
    );
    return { success: true, deletedRecipeId: request.recipeId };
  }
}