import { apiClient } from "@/core/api/axios.api";
import type {
  GetProjectBillOfQuantsRequest,
  UpdateLineItemsRequest,
  UpdateProjectStatusRequest,
  DeleteLineItemsRequest,
  DeleteProjectBillOfQuantitiesRequest,
  GetRecipeOptionsRequest,
  AddLineItemRequest,
  GetRecipeCatalogueRequest,
  CreateCatalogueItemRequest,
  CreateCategoryRequest,
  CreateRecipeRequest,
} from "@/modules/quantityTakeoff/contracts/quantityTakeOff.request";
import type {
  GetBillOfQuantsResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantitiesResponse,
  GetRecipeOptionsResponse,
  GetRecipeCatalogueResponse,
  CreateCatalogueItemResponse,
  CreateCategoryResponse,
  CreateRecipeResponse,
} from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";

// The backend identifies the user from the Clerk token that apiClient attaches
// to every request, and checks the project belongs to them.

// Every line item of the project's takeoff, each with its recipe
export async function getProjectBillOfQuantities(
  request: GetProjectBillOfQuantsRequest,
): Promise<GetBillOfQuantsResponse[]> {
  const response = await apiClient.get(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities`,
  );
  return response.data;
}

// Saves the edited location, notes and measurement of the given line items
export async function updateLineItems(
  request: UpdateLineItemsRequest,
): Promise<UpdateLineItemsResponse> {
  const response = await apiClient.put(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities`,
    request.lineItems,
  );
  return response.data;
}

export async function updateProjectStatus(
  request: UpdateProjectStatusRequest,
): Promise<UpdateProjectStatusResponse> {
  const response = await apiClient.patch(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/status`,
    { completed: request.completed },
  );
  return response.data;
}

// A POST rather than a DELETE because the ids travel in the request body
export async function deleteLineItems(
  request: DeleteLineItemsRequest,
): Promise<DeletedLineItemsResponse> {
  const response = await apiClient.post(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/delete`,
    { lineItemIds: request.lineItemIds },
  );
  return response.data;
}

// Removes every line item of the project
export async function deleteProjectBillOfQuantities(
  request: DeleteProjectBillOfQuantitiesRequest,
): Promise<DeleteProjectBillOfQuantitiesResponse> {
  const response = await apiClient.delete(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities`,
  );
  return response.data;
}
export async function getRecipeOptions(
  request: GetRecipeOptionsRequest,
): Promise<GetRecipeOptionsResponse> {
  const response = await apiClient.get(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/recipe-options`,
  );
  return response.data;
}

// Adds one line to the project's takeoff and returns it in the same shape the
// takeoff lists, so the page can append it without reloading.
export async function addLineItem(
  request: AddLineItemRequest,
): Promise<GetBillOfQuantsResponse> {
  const response = await apiClient.post(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities`,
    {
      recipeId: request.recipeId,
      measurement: request.measurement,
      description: request.description,
      notes: request.notes,
    },
  );
  return response.data;
}

export async function getRecipeCatalogue(
  request: GetRecipeCatalogueRequest,
): Promise<GetRecipeCatalogueResponse> {
  const response = await apiClient.get(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/recipe-catalogue`,
  );
  return response.data;
}

// Adds a material, labour or overhead that was missing from the catalogue.
export async function createCatalogueItem(
  request: CreateCatalogueItemRequest,
): Promise<CreateCatalogueItemResponse> {
  const response = await apiClient.post(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/catalogue-items`,
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
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/categories`,
    { name: request.name },
  );
  return response.data;
}

// Creates a recipe with its components and returns it in the shape the
// "Add line item" picker lists recipes.
export async function createRecipe(
  request: CreateRecipeRequest,
): Promise<CreateRecipeResponse> {
  const response = await apiClient.post(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/recipes`,
    {
      name: request.name,
      categoryId: request.categoryId,
      unit: request.unit,
      description: request.description,
      materials: request.materials,
      labour: request.labour,
      overheads: request.overheads,
    },
  );
  return response.data;
}
