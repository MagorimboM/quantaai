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

export function ViewDocumentModal({ document }: { document?: Documents }) {
  // !! 1. interpret bytes or give it to something so it can be viewed
  // !! 2. implement scroll effect.
  // !! Last but not least clear up the styling
  return (
    <>
      <div title="view-doc-modal">
        <h1 title="view-doc-modal-header">{document?.document.name}</h1>
        <iframe></iframe>
      </div>
    </>
  );
}
