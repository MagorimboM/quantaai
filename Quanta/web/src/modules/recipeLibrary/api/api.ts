import { apiClient } from "@/core/api/axios.api";
import type {
  UserRecipeCategoriesRequest,
  SearchRecipeRequest,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts";
import type {
  Recipe,
  UserRecipeCategoriesResponse,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// TODO :: move the contracts to the contracts folders
// TODO :: create api request to the backend on updating recipes, archiving recipes, deleting recipes
// TODO :: create api request to the backend on creating new recipe, grab list of archived recipes.

export async function searchRecipe(
  request: SearchRecipeRequest,
): Promise<Recipe[]> {
  const response = await apiClient.get(
    `recipe-library/companies/${request.companyId}/categories/${request.categoryId}/recipes/search?term=${request.term}&page=${request.page}&limit=${request.limit}`,
  );
  return response.data;
}

export async function getUserRecipeCategories(
  request: UserRecipeCategoriesRequest,
): Promise<UserRecipeCategoriesResponse> {
  const response = await apiClient.get(
    `recipe-library/companies/${request.companyId}/categories`,
  );

  return response.data;
}

export async function getCategoryRecipe(request: {
  categoryId: string;
  companyId: string;
  page: number;
  limit: number;
}): Promise<Recipe[]> {
  const response = await apiClient.get(
    `recipe-library/companies/${request.companyId}/categories/${request.categoryId}/recipes?page=${request.page}&limit=${request.limit}`,
  );

  return response.data;
}