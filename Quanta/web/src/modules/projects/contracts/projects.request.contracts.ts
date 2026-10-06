import type { DocumentType } from "@/modules/projects/contracts/projects.response.contracts";

// None of these carry a userId: the backend identifies the user from the Clerk
// token and checks the company belongs to them.

// One page of the company's projects, optionally filtered by a search term
// (matched against project name and description).
export type GetListOfProjectsRequest = {
  companyId: string;
  term?: string;
  page: number;
  limit: number;
};

// Every document the user may see for a project
export type GetFilesRequest = {
  companyId: string;
  projectId: string;
};

export type DeleteFileRequest = {
  companyId: string;
  projectId: string;
  documentId: string;
};

// Files picked in the upload modal, saved on one shelf (see DocumentType)
export type UploadFilesRequest = {
  companyId: string;
  projectId: string;
  documentType: DocumentType;
  files: File[];
};