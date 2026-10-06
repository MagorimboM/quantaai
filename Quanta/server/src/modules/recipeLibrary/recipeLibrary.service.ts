import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecipeLibraryRepository } from '@/modules/recipeLibrary/recipeLibrary.repository';
import { AccessService } from '@/auth/services/access.service';
import type { UpdateRecipeRequest } from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';
import type {
  Recipe,
  UserRecipeCategoriesResponse,
  GetRecipesResponse,
  ArchiveRecipeResponse,
  DeleteRecipeResponse,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts';

// The most recipes one request may return, however large a limit is asked for
const MAX_PAGE_SIZE = 50;

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