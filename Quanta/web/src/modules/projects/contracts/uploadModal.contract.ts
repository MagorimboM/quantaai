
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

export type UploadModalProps = {
  document: Document;
  bytes: string | null;
  closeModal: () => void;
};


