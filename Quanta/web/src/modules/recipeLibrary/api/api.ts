import { apiClient } from "@/core/api/axios.api";
import type {
  UserRecipeCategoriesRequest,
  GetRecipesRequest,
  UpdateRecipeRequest,
  ArchiveRecipeRequest,
  DeleteRecipeRequest,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts";
import type {
  Recipe,
  UserRecipeCategoriesResponse,
  GetRecipesResponse,
  ArchiveRecipeResponse,
  DeleteRecipeResponse,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// The backend identifies the user from the Clerk token that apiClient attaches
// to every request, and checks the company belongs to them.

// The company's categories, with a leading "All" entry, each with its recipe count
export async function getUserRecipeCategories(
  request: UserRecipeCategoriesRequest,
): Promise<UserRecipeCategoriesResponse> {
  const response = await apiClient.get(
    `${request.companyId}/recipe-library/categories`,
  );
  return response.data;
}

// One page of recipes: live or archived, one category or all, optionally
// matching a search term
export async function getRecipes(
  request: GetRecipesRequest,
): Promise<GetRecipesResponse> {
  const response = await apiClient.get(
    `${request.companyId}/recipe-library/recipes`,
    {
      // axios leaves out a term that is undefined
      params: {
        categoryId: request.categoryId,
        term: request.term,
        archived: request.archived,
        page: request.page,
        limit: request.limit,
      },
    },
  );
  return response.data;
}

// Saves an edited recipe and returns it as the library shows it
export async function updateRecipe(request: UpdateRecipeRequest): Promise<Recipe> {
  const { companyId, recipeId, ...changes } = request;
  const response = await apiClient.patch(
    `${companyId}/recipe-library/recipes/${recipeId}`,
    changes,
  );
  return response.data;
}

// Archives a recipe (hides it, keeps it) or restores an archived one
export async function archiveRecipe(
  request: ArchiveRecipeRequest,
): Promise<ArchiveRecipeResponse> {
  const response = await apiClient.patch(
    `${request.companyId}/recipe-library/recipes/${request.recipeId}/archive`,
    { archived: request.archived },
  );
  return response.data;
}

// Permanently deletes a recipe. Refused if a takeoff still uses it.
export async function deleteRecipe(
  request: DeleteRecipeRequest,
): Promise<DeleteRecipeResponse> {
  const response = await apiClient.delete(
    `${request.companyId}/recipe-library/recipes/${request.recipeId}`,
  );
  return response.data;
}