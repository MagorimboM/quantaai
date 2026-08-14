import { apiClient } from "@/core/api/axios.api";
import type { Category, Recipe } from "@/modules/recipeLibrary/contracts/types";

// TODO :: move the contracts to the contracts folders
// TODO :: create api request to the backend on updating recipes, archiving recipes, deleting recipes
// TODO :: create api request to the backend on creating new recipe, grab list of archived recipes.

type SearchRecipeRequest = {
  term: string;
  page: number;
  pageLimit: number;
  companyId: string;
  categoryId: string;
  categoryName?: string | "all";
};

export async function searchRecipe(
  request: SearchRecipeRequest,
): Promise<Recipe[]> {
  const response = await apiClient.get(
    `/companies/${request.companyId}/categories/${request.categoryId}/recipes/search`,
    {
      params: {
        query: request.term,
        page: request.page,
        limit: request.pageLimit,
      },
    },
  );
  return response.data;
}
type UserRecipeCategoriesRequest = {
  companyId: string;
  userId?: string;
};

type UserRecipeCategoriesResponse = {
  companyId: string;
  companyName: string;
  categories: Category[];
};

export async function getUserRecipeCategories(
  request: UserRecipeCategoriesRequest,
): Promise<UserRecipeCategoriesResponse> {
  const response = await apiClient.get(
    `/companies/${request.companyId}/categories`,
  );

  return response.data;
}

export async function getCategoryRecipe(request: {
  categoryId: string;
  companyId: string;
}): Promise<Recipe[]> {
  const response = await apiClient.get(
    `/companies/${request.companyId}/categories/${request.categoryId}/`,
  );

  return response.data;
}
