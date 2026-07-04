import { useEffect, useState } from "react";
import { AiOutlineFile } from "react-icons/ai";
import { Eye, TrashIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFiles } from "@/modules/projects/api/api";
import type { ViewFileModalProps } from "@/modules/projects/contracts/viewFileModal.contract";
import type { Document } from "@/modules/projects/contracts/viewFileModal.contract";
import { DeletingComp } from "@/common/components/delete";

// TODO ::  implement delete file function

export function ViewFileModalComp(document: ViewFileModalProps) {
  const [showFile, setShowFile] = useState<boolean>(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [showDeleteComp, setShowDeleteComp] = useState<{
    message: string;
    showDeletingFileModal: boolean;
  }>({ message: "", showDeletingFileModal: false });

  useEffect(() => {
    if (!showFile || !document?.bytes) {
      setPdfSrc(null);
      return;
    }
    setPdfSrc(`data:application/pdf;base64,${document.bytes}`);
  }, [showFile, document]);

  function closeFileViewer() {
    setShowFile(false);
    setPdfSrc(null);
  }

  function openFileViewer() {
    setShowFile(true);
  }

  async function deleteFile(file: Document) {
    // display the delete file modal..
    setShowDeleteComp({
      message: `Deleting file:${file.name}`,
      showDeletingFileModal: true,
    });
    const response = await deleteFiles({
      documentId: file.id,
      companyId: file.companyId,
      projectId: file.projectId,
    });

    // remove the delete file modal..

    if (response.success == true) {
      setShowDeleteComp({
        message: ``,
        showDeletingFileModal: false,
      });
    }
  }

  return (
    <>
      {showFile == true ? (
        <div className="fixed inset-3 z-100 flex flex-col rounded-lg bg-background shadow-2xl">
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
          <div>
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="icon"
              onClick={openFileViewer}
            >
              <Eye size={16} />
            </Button>
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="icon"
              onClick={() => deleteFile(document.document)}
            >
              <TrashIcon size={16} />
            </Button>
          </div>
        </div>
      )}

      {showDeleteComp.showDeletingFileModal == true ? (
        <DeletingComp message={showDeleteComp.message} />
      ) : null}
    </>
  );
}
