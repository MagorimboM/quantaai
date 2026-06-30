import { getDocuments, deleteDocument } from "@/modules/projects/api/api";
import { useState, useEffect } from "react";
import { ViewDocumentModal } from "@/modules/projects/components/viewDocumentModal";
import { AiOutlineFile } from "react-icons/ai";
import { Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

const DUMMY_DATA = {
  projectId: "seed-proj-001",
  documentId: "seed-doc-001",
  companyId: "seed-company-001",
};

export function DocumentsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [viewDocumentModal, setViewDocumentModal] = useState<boolean>(false);
  const [viewDocument, setViewDocument] = useState<Documents>();

  useEffect(() => {
    async function fetchDocuments() {
      const files = await getDocuments({
        projectId: DUMMY_DATA.projectId,
        companyId: DUMMY_DATA.companyId,
      });
      setDocuments(files);
    }
    fetchDocuments();
  }, []);

  async function removeDocument({
    documentId,
    companyId,
    projectId,
  }: {
    documentId?: string | null;
    companyId?: string | null;
    projectId?: string | null;
  }) {
    await deleteDocument({
      projectId: projectId,
      companyId: companyId,
      documentId: documentId,
    });

    setDocuments((documents) =>
      documents.filter((doc) => doc.document.id != documentId),
    );
  };

  async function openDocument({ document }: { document: Documents }) {
    setViewDocument(document);
    setViewDocumentModal(true);
  };

  async function closeDocument() {
    setViewDocument(undefined);
    setViewDocumentModal(false);
  };

  return (
    <>
      {/* DocumentsModal owns this — it opens and closes ViewDocumentModal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Documents</DialogTitle>
          </DialogHeader>

          <div title="docs-container" className="flex flex-col gap-4">

            {/* company documents */}
            <div title="company-docs" className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Company Documents
              </p>
              {documents.map((document) => {
                if (document.document.documentType === "companyDocument") {
                  return (
                    <div
                      key={document.document.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <AiOutlineFile className="text-muted-foreground" />
                        {document.document.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDocument({ document })}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  );
                }
              })}
            </div>

            <Separator />

            {/* project documents */}
            <div title="project-docs" className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Project Documents
              </p>
              {documents.map((document) => {
                if (document.document.documentType === "projectDocument") {
                  return (
                    <div
                      key={document.document.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <AiOutlineFile className="text-muted-foreground" />
                        {document.document.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDocument({ document })}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            removeDocument({
                              documentId: document.document.id,
                              companyId: document.document.companyId,
                              projectId: document.document.projectId,
                            })
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>

            <Separator />

            {/* personal documents */}
            <div title="personal-docs" className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Personal Documents
              </p>
              {documents.map((document) => {
                if (document.document.documentType === "personalDocument") {
                  return (
                    <div
                      key={document.document.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <AiOutlineFile className="text-muted-foreground" />
                        {document.document.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDocument({ document })}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  );
                }
              })}
            </div>

          </div>

          {documents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <AiOutlineFile size={32} />
              <p className="text-sm">No documents found</p>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* ViewDocumentModal — DocumentsModal owns this */}
      <Dialog open={viewDocumentModal} onOpenChange={closeDocument}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewDocument?.document.name}</DialogTitle>
          </DialogHeader>
          <div title="document-view-container" className="mt-2">
            <ViewDocumentModal document={viewDocument} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}