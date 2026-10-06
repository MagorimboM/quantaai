import { apiClient } from "@/core/api/axios.api";
import type {
  RecipeBuilderOptionsRequest,
  SearchMaterialsRequest,
  CreateRecipeRequest,
} from "@/modules/recipeBuilder/contracts/recipeBuilder.request.contracts";
import type {
  Category,
  SiteCondition,
  MaterialSearchResult,
  CreateRecipeResponse,
} from "@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts";

// The backend identifies the user from the Clerk token that apiClient attaches
// to every request, and checks the company belongs to them.

// The company's categories: the recipe types, and the groups materials sit in
export async function getRecipeCategories(
  request: RecipeBuilderOptionsRequest,
): Promise<Category[]> {
  const response = await apiClient.get(
    `${request.companyId}/recipe/new-recipe/categories`,
  );
  return response.data;
}

export async function getSiteConditions(
  request: RecipeBuilderOptionsRequest,
): Promise<SiteCondition[]> {
  const response = await apiClient.get(
    `${request.companyId}/recipe/new-recipe/site-conditions`,
  );
  return response.data;
}

export async function searchMaterials(
  request: SearchMaterialsRequest,
): Promise<MaterialSearchResult[]> {
  const response = await apiClient.get(
    `${request.companyId}/recipe/new-recipe/materials`,
    {
      // axios leaves out any filter that is undefined
      params: {
        term: request.term,
        categoryId: request.categoryId,
        siteConditionId: request.siteConditionId,
      },
    },
  );
  return response.data;
}

export async function createNewRecipe(
  request: CreateRecipeRequest,
): Promise<CreateRecipeResponse> {
  const { companyId, ...recipe } = request;
  const response = await apiClient.post(
    `${companyId}/recipe/new-recipe`,
    recipe,
  );
  return response.data;
}