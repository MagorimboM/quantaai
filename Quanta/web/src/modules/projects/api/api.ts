import { apiClient } from "@/core/api/axios.api";
import type {
  GetFilesRequest,
  DeleteFileRequest,
  UploadFilesRequest,
  GetListOfProjectsRequest,
} from "@/modules/projects/contracts/projects.request.contracts";
import type {
  GetFilesResponse,
  DeleteFileResponse,
  UploadFilesResponse,
  GetListOfProjectsResponse,
} from "@/modules/projects/contracts/projects.response.contracts";

// The backend identifies the user from the Clerk token that apiClient attaches
// to every request, so no call here sends a userId.

// One page of the company's projects, most recently updated first
export async function getListOfProjects(
  request: GetListOfProjectsRequest,
): Promise<GetListOfProjectsResponse> {
  const response = await apiClient.get(`${request.companyId}/projects`, {
    params: {
      term: request.term || undefined,
      page: request.page,
      limit: request.limit,
    },
  });
  return response.data;
}

// The company, project and personal documents for a project, each with its file
export async function getFiles(
  request: GetFilesRequest,
): Promise<GetFilesResponse> {
  const response = await apiClient.get(
    `${request.companyId}/files/${request.projectId}`,
  );
  return response.data;
}

// Uploads the picked files as one multipart request.
// TODO :: [backend] The upload route should take the company from the URL and the
// user from the token, and ignore these form fields. Then companyId and
// projectId can go from the form (the user is never sent from the browser).
export async function uploadFiles(
  request: UploadFilesRequest,
): Promise<UploadFilesResponse> {
  const formData = new FormData();
  formData.append("companyId", request.companyId);
  formData.append("projectId", request.projectId);
  formData.append("documentType", request.documentType);
  for (const file of request.files) {
    formData.append("files", file);
  }

  const response = await apiClient.post<UploadFilesResponse>(
    `${request.companyId}/files/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function deleteFile(
  request: DeleteFileRequest,
): Promise<DeleteFileResponse> {
  const response = await apiClient.delete(
    `${request.companyId}/files/${request.projectId}/${request.documentId}`,
  );
  return response.data;
}