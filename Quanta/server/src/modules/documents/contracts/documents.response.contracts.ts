export type File = {
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

export type GetFilesResponse = {
  file: File;
  bytes: Uint8Array<ArrayBuffer> | undefined;
};


export type DeleteFileResponse = {
  success: boolean;
  message: string;
};