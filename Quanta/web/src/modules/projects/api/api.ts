import { apiClient } from "@/core/api/axios.api";

type projectUploadsResponse = {
  success: boolean;
  message: string;
  savedDocuments: any[];
};

export type Document = {
  id?: string;
  userId?: string | null;
  companyId?: string | null;
  projectId?: string | null;
  name: string;
  fileUrl: string;
  fileType: string;
  documentType?: string | null;
  documentTitle?: string | null;
  documentDate?: Date | null;
  documentAuthor?: string | null;
  documentVersion?: string | null;
  issuedBy?: string | null;
  extractedText?: string | null;
  status: string;
  isArchived: boolean;
  archivedAt?: Date | null;
  archivedReason?: string | null;
  uploadedAt: Date;
};

export type Documents = {
  document: Document;
  bytes: Uint8Array | undefined;
};

export type DocumentDeletionResponse = {
  success: boolean;
  message: string;
};

export async function sendUploadedFilesToBackEnd(
  formData?: FormData,
): Promise<projectUploadsResponse> {
  const response = await apiClient.post<projectUploadsResponse>(
    "documents/upload",
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

export async function getDocuments({
  projectId,
  companyId,
}: {
  projectId: string;
  companyId: string;
}): Promise<Documents[]> {
  const response = await apiClient.get(`/files/${projectId}/${companyId}`);
  return response.data;
}

export async function deleteDocument({
  projectId,
  companyId,
  documentId,
}: {
  projectId?: string | null;
  companyId?: string | null;
  documentId?: string | null;
}): Promise<DocumentDeletionResponse> {
  const response = await apiClient.delete(
    `files/${projectId}/${companyId}/${documentId}`,
  );
  return response.data;
}
