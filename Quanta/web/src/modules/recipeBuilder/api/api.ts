import { apiClient } from "@/core/api/axios.api";
import type {
  RecipeBuilderOptionsRequest,
  SearchMaterialsRequest,
  CreateRecipeRequest,
  CreateSiteClassRequest,
} from "@/modules/recipeBuilder/contracts/recipeBuilder.request.contracts";
import type {
  Category,
  SiteCondition,
  BuildingClassOption,
  SiteClassOption,
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

// The building classes a recipe can suit
export async function getBuildingClasses(
  request: RecipeBuilderOptionsRequest,
): Promise<BuildingClassOption[]> {
  const response = await apiClient.get(
    `${request.companyId}/recipe/new-recipe/building-classes`,
  );
  return response.data;
}

// The site classes a recipe can suit, in AS 2870 order (A, S, M, H1, H2, E, P)
export async function getSiteClasses(
  request: RecipeBuilderOptionsRequest,
): Promise<SiteClassOption[]> {
  const response = await apiClient.get(
    `${request.companyId}/recipe/new-recipe/site-classes`,
  );
  return response.data;
}

// Adds a site class. Refused (409) if one with that name already exists.
export async function createSiteClass(
  request: CreateSiteClassRequest,
): Promise<SiteClassOption> {
  const { companyId, ...siteClass } = request;
  const response = await apiClient.post(
    `${companyId}/recipe/new-recipe/site-classes`,
    siteClass,
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

// Creates the recipe with its ingredients and the building / site classes it suits
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

// TODO :: [frontend] This URL doesn't match the backend route, which is
// `${companyId}/recipe/new-recipe/category/${term}`, so it always fails. Fix it
// together with whatever calls searchCategory.
export async function searchCategory(searchTerm: string): Promise<
  {
    id: string;
    name: string;
    description: string;
  }[]
> {
  const response = await apiClient.get(`/category/query?${searchTerm}`);
  return response.data;
}