import { useEffect, useState } from "react";
import { AiOutlineFile } from "react-icons/ai";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/modules/projects/api/api";
import type { ViewDocumentModalProps } from "@/modules/projects/contracts/viewDocumentModal.contract";

// TODO ::  implement delete file function

export function ViewDocumentModal(document: ViewDocumentModalProps) {
  const [showFile, setShowFile] = useState<boolean>(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!showFile || !document?.bytes) {
      setPdfSrc(null);
      return;
    }
    setPdfSrc(`data:application/pdf;base64,${document.bytes}`);
  }, [showFile, document]);

  async function removeDocument({
    documentId,
    companyId,
    projectId,
  }: {
    documentId?: string | null;
    companyId?: string | null;
    projectId?: string | null;
  }) {
    const response = await deleteDocument({
      projectId: projectId,
      companyId: companyId,
      documentId: documentId,
    });

    if (response.success == true) {
      // remove the document from the list of documents.
    }
  }

  function closeFileViewer() {
    setShowFile(false);
    setPdfSrc(null);
  }

  function openFileViewer() {
    setShowFile(true);
  }

  return (
    <>
      {showFile == true ? (
        <div className="fixed inset-3 z-[9999] flex flex-col rounded-lg bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h1
              title="view-doc-modal-header"
              className="text-sm font-medium truncate"
            >
              {document?.document.name}
            </h1>
            <Button variant="ghost" size="icon" onClick={closeFileViewer}>
              <X size={16} />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            {pdfSrc ? (
              <iframe
                src={pdfSrc}
                title={document?.document.name ?? "document"}
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading document…
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          key={document?.document.id}
          className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <AiOutlineFile className="text-muted-foreground" />
            {document?.document.name}
          </div>
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={openFileViewer}
          >
            <Eye size={16} />
          </Button>
        </div>
      )}
    </>
  );
}
