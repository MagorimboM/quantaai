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

// A new project, as the form sends it.
//
// projectPostCode is text, not a number: Australian postcodes can start with 0
// (Darwin is "0800"), which a number would drop, and the database stores it as
// text. null until the user types one.
// Phone numbers are in international form, e.g. "+61412345678".
export type CreateNewProjectRequest = {
  projectNumber: string;
  projectName: string;
  projectDescription: string;
  projectContactName: string;
  projectPhoneNumber: string;
  projectAddress: string;
  projectCity: string;
  projectPostCode: string | null;
  projectState: string;
  projectCountry: string;
  projectType: string;
  // TODO :: nothing on the form sets this. Remove it, or say what it holds.
  projectContact: number | null;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
};