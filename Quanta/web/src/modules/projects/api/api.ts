import { apiClient } from "@/core/api/axios.api";
import type {
  projectUploadsResponse,
  DocumentDeletionResponse,
  GetFilesResponse,
} from "@/modules/projects/contracts/api.response";
import type {
  GetFilesRequest,
  DeleteFilesRequest,
} from "@/modules/projects/contracts/api.requests";

export async function sendUploadedFilesToBackEnd(
  companyId: string,
  formData?: FormData,
): Promise<projectUploadsResponse> {
  const response = await apiClient.post<projectUploadsResponse>(
    `${companyId}/files/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  console.log(response.data);
  return response.data;
}

export async function getFiles(
  request: GetFilesRequest,
): Promise<GetFilesResponse[]> {
  const response = await apiClient.get(
    `/${request.companyId}/files/${request.projectId}`,
  );
  console.log({ message: "the bytes from backend", bytes: response.data });
  return response.data;
}

export async function deleteFiles(
  request: DeleteFilesRequest,
): Promise<DocumentDeletionResponse> {
  const response = await apiClient.delete(
    `${request.companyId}/files/${request.projectId}/${request.documentId}`,
  );
  return response.data;
}