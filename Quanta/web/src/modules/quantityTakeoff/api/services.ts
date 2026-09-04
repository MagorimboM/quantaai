import { apiClient } from "@/core/api/axios.api";
import type {
  GetBillOfQuantsResponse,
  UpdateLineItemResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantitiesResponse,
  DeleteProjectResponse,
} from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import type {
  UpdateLineItemRequest,
  UpdateProjectStatusRequest,
  DeleteProjectLineItemsRequest,
  DeleteProjectBillOfQuantsRequest,
  DeleteProjectRequest,
} from "@/modules/quantityTakeoff/contracts/quantityTakeOff.request";

export async function getRecipe(request: {
  companyId: string;
  projectId: string;
  query: string;
  page: number;
  limit: number;
}): Promise<any> {
  const response = await apiClient.get(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities?query=${request.query}&page=${request.page}&limit=${request.limit}`,
  );

  return response.data;
}

export async function getProjectBillOfQuantities(request: {
  companyId: string;
  projectId: string;
  query: string;
  page: number;
  limit: number;
}): Promise<GetBillOfQuantsResponse[]> {
  const response = await apiClient.get(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities?query=${request.query}&page=${request.page}&limit=${request.limit}`,
  );
  return response.data;
}

export async function updateLineItem(
  request: UpdateLineItemRequest,
): Promise<UpdateLineItemResponse[]> {
  const response = await apiClient.put(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities`,
    request.body,
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

export async function deleteLineItem(
  request: DeleteProjectLineItemsRequest,
): Promise<DeletedLineItemsResponse> {
  console.log(request.lineItems);
  const response = await apiClient.post(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities/delete`,
    request.lineItems,
  );

  return response.data;
}

export async function deleteProjectBillOfQuantities(
  request: DeleteProjectBillOfQuantsRequest,
): Promise<DeleteProjectBillOfQuantitiesResponse> {
  const response = await apiClient.delete(
    `${request.companyId}/projects/${request.projectId}/bill-of-quantities`,
  );

  return response.data;
}

export async function DeleteProject(
  request: DeleteProjectRequest,
): Promise<DeleteProjectResponse> {
  const response = await apiClient.delete(
    `${request.companyId}/projects/${request.projectId}`,
  );
  return response.data;
}