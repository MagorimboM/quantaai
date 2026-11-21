import { apiClient } from "@/core/api/axios.api";
import type {
  UserRecipeCategoriesRequest,
  GetRecipesRequest,
  UpdateRecipeRequest,
  ArchiveRecipeRequest,
  DeleteRecipeRequest,
  GetRecipeCatalogueRequest,
  GetRecipeClassificationsRequest,
  CreateCatalogueItemRequest,
  CreateCategoryRequest,
  CreateRecipeRequest,
  CreateBuildingClassRequest,
  CreateSiteClassRequest,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts";
import type {
  Recipe,
  UserRecipeCategoriesResponse,
  GetRecipesResponse,
  GetRecipeClassificationsResponse,
  ArchiveRecipeResponse,
  DeleteRecipeResponse,
  CreateCatalogueItemResponse,
  GetRecipeCatalogueResponse,
  CreateCategoryResponse,
  CreateSiteClassResponse,
  CreateBuildingClassResponse,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// The backend identifies the user from the Clerk token that apiClient attaches
// to every request, and checks the company belongs to them.

// The user's site classes and building classes, for the two selectors at the
// top of the library, each with the company's live recipe count
export async function getRecipeClassifications(
  request: GetRecipeClassificationsRequest,
): Promise<GetRecipeClassificationsResponse> {
  const response = await apiClient.get(
    `${request.companyId}/recipe-library/classifications`,
  );
  return response.data;
}

// Adds a building class. Refused (409) if the user already has one with that
// name.
export async function createBuildingClass(
  request: CreateBuildingClassRequest,
): Promise<CreateBuildingClassResponse> {
  const { companyId, ...buildingClass } = request;
  const response = await apiClient.post(
    `${companyId}/recipe-library/building-classes`,
    buildingClass,
  );
  return response.data;
}

// Adds a site class. Refused (409) if the user already has one with that name.
export async function createSiteClass(
  request: CreateSiteClassRequest,
): Promise<CreateSiteClassResponse> {
  const { companyId, ...siteClass } = request;
  const response = await apiClient.post(
    `${companyId}/recipe-library/site-classes`,
    siteClass,
  );
  return response.data;
}

// The company's categories, with a leading "All" entry, each with its recipe
// count for the chosen building class and site class ("all" or left out = every class)
export async function getUserRecipeCategories(
  request: UserRecipeCategoriesRequest,
): Promise<UserRecipeCategoriesResponse> {
  const response = await apiClient.get(
    `${request.companyId}/recipe-library/categories`,
    {
      // axios leaves out a class that is undefined
      params: {
        buildingClassId: request.buildingClassId,
        siteClassId: request.siteClassId,
      },
    },
  );
  return response.data;
}

// One page of recipes: live or archived, one category or all, one building
// class and site class or all, optionally matching a search term
export async function getRecipes(
  request: GetRecipesRequest,
): Promise<GetRecipesResponse> {
  const response = await apiClient.get(
    `${request.companyId}/recipe-library/recipes`,
    {
      // axios leaves out a term or class that is undefined
      params: {
        categoryId: request.categoryId,
        buildingClassId: request.buildingClassId,
        siteClassId: request.siteClassId,
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



// The categories, materials, labour and overheads a new recipe can be built from
export async function getRecipeCatalogue(
  request: GetRecipeCatalogueRequest,
): Promise<GetRecipeCatalogueResponse> {
  const response = await apiClient.get(
    `${request.companyId}/recipe-library/catalogue`,
  );
  return response.data;
}

// Adds a material, labour or overhead that was missing from the catalogue
export async function createCatalogueItem(
  request: CreateCatalogueItemRequest,
): Promise<CreateCatalogueItemResponse> {
  const response = await apiClient.post(
    `${request.companyId}/recipe-library/catalogue-items`,
    {
      kind: request.kind,
      name: request.name,
      unit: request.unit,
      categoryId: request.categoryId,
      labourType: request.labourType,
    },
  );
  return response.data;
}

export async function createCategory(
  request: CreateCategoryRequest,
): Promise<CreateCategoryResponse> {
  const response = await apiClient.post(
    `${request.companyId}/recipe-library/categories`,
    { name: request.name },
  );
  return response.data;
}

// Creates a recipe with its components, linked to the building classes and
// site classes it suits, and returns it as the library shows it
export async function createRecipe(request: CreateRecipeRequest): Promise<Recipe> {
  const { companyId, ...recipe } = request;
  const response = await apiClient.post(
    `${companyId}/recipe-library/recipes`,
    recipe,
  );
  return response.data;
}