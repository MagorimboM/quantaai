import { apiClient } from "@/core/api/axios.api";
import type {
  GetProjectBillOfQuantsRequest,
  UpdateLineItemsRequest,
  UpdateProjectStatusRequest,
  DeleteLineItemsRequest,
  DeleteProjectBillOfQuantitiesRequest,
} from "@/modules/quantityTakeoff/contracts/quantityTakeOff.request";
import type {
  GetBillOfQuantsResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantitiesResponse,
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