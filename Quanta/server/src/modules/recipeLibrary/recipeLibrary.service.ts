import { Injectable } from '@nestjs/common';
import type {
  SearchRecipeRequest,
  GetCategoryRecipeRequest,
  UserRecipeCategoriesRequest,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts';

import { RecipeLibraryRepository } from '@/modules/recipeLibrary/recipeLibrary.repository';

@Injectable()
export class RecipeLibraryService {
  constructor(
    private readonly recipeLibraryRepository: RecipeLibraryRepository,
  ) {}
  async searchRecipe(request: SearchRecipeRequest) {
    const results = await this.recipeLibraryRepository.searchRecipe(request);
    return results;
  }

  async getUserRecipeCategories(request: UserRecipeCategoriesRequest) {
    const results =
      await this.recipeLibraryRepository.getUserRecipeCategories(request);
    return results;
  }

  async getCategoryRecipe(request: GetCategoryRecipeRequest) {
    const results =
      await this.recipeLibraryRepository.getCategoryRecipe(request);
    return results;
  }
}
