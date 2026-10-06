// Which of the user's three document shelves a file sits on:
//  - projectDocument: uploaded against one project (that job's specs and drawings)
//  - companyDocument: uploaded against the company, used across its projects
//                     (policies, standards)
//  - userDocument:    personal, kept outside any company or project
// The AI assistant reads all three.
export type DocumentType =
  | "projectDocument"
  | "companyDocument"
  | "userDocument";

// The fields of a stored document that the screens use
export type StoredDocument = {
  id: string;
  name: string;
  documentType: DocumentType | null;
};

// A document together with its file. `bytes` is the file base64-encoded, or
// null when it couldn't be read.
export type StoredFile = {
  document: StoredDocument;
  bytes: string | null;
};

export type GetFilesResponse = StoredFile[];

export type UploadFilesResponse = {
  success: boolean;
  message: string;
};

export type DeleteFileResponse = {
  success: boolean;
  message: string;
};

// One project in the list. Dates arrive as ISO strings over JSON, not Date objects.
export type ProjectSummary = {
  id: string;
  companyId: string | null;
  name: string;
  type: string;
  status: string;
  updatedAt: string;
  numberOfLineItems: number;
};

export type GetListOfProjectsResponse = {
  totalCount: number;
  page: number;
  limit: number;
  projects: ProjectSummary[];
};