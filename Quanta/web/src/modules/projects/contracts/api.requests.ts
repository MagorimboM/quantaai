export type GetFilesRequest = {
  projectId: string;
  companyId: string;
};

export type DeleteFilesRequest = {
  projectId?: string | null;
  companyId?: string | null;
  documentId?: string | null;
}
