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
  return response.data;
}

export async function getFiles(
  request: GetFilesRequest,
): Promise<GetFilesResponse[]> {
  const response = await apiClient.get(
    `/${request.companyId}/files/${request.projectId}`,
  );
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

type ProjectSummary = {
  companyId: string | null;
  createdAt: Date;
  description: string | null;
  id: string;
  name: string;
  status: string;
  takeoffItems: {
    description: string;
    id: string;
    projectId: string;
  }[];
  type: string;
  updatedAt: Date;
};

type PaginatedProjects = {
  totalCount: number;
  page: number;
  limit: number;
  projects: ProjectSummary[];
};

export async function getListOfProjects(request: {
  companyId: string;
  userId: string;
  term?: string;
  page: number;
  limit: number;
}): Promise<PaginatedProjects> {
  const response = await apiClient.get(
    `/${request.companyId}/projects?userId=${request.userId}&term=${encodeURIComponent(request.term ?? "")}&page=${request.page}&limit=${request.limit}`,
  );
  return response.data;
}