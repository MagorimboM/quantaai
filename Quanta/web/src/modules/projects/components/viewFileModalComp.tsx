import { useState } from "react";
import { AiOutlineFile } from "react-icons/ai";
import { Eye, TrashIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFile } from "@/modules/projects/api/api";
import type { StoredDocument } from "@/modules/projects/contracts/projects.response.contracts";
import { DeletingComp } from "@/common/components/delete";

/**
 * One document row: its name, an eye to open it in a full-screen viewer, and a
 * bin to delete it. After the backend deletes it, `onDeleted` tells the list to
 * drop the row, so a deleted file disappears straight away.
 *
 * The viewer shows the file as a PDF, so only PDFs display correctly.
 * TODO :: [backend] Deleting needs a project in the URL, so company and
 * personal documents (which have none) can't be addressed properly.
 * TODO :: [design] Deleting happens on click with no "are you sure?". A
 * deleted spec is gone, along with what the assistant knew from it.
 */
export function ViewFileModalComp({
  file,
  bytes,
  companyId,
  projectId,
  onDeleted,
}: {
  file: StoredDocument;
  bytes: string | null;
  companyId: string;
  projectId: string;
  onDeleted: (documentId: string) => void;
}) {
  const [showFile, setShowFile] = useState<boolean>(false);
  // Set while a delete is in progress; the text shown in the "Deleting" overlay
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);

  // Files arrive base64-encoded, so the viewer reads them as a data URL
  const pdfSrc = showFile && bytes ? `data:application/pdf;base64,${bytes}` : null;

  async function deleteThisFile() {
    setDeletingMessage(`Deleting file: ${file.name}`);
    try {
      const response = await deleteFile({
        companyId,
        projectId,
        documentId: file.id,
      });
      if (response.success) onDeleted(file.id);
    } catch {
      // apiClient already reports the failure; the row stays in the list
    } finally {
      setDeletingMessage(null);
    }
  }

  return (
    <>
      {showFile ? (
        <div className="fixed inset-3 z-100 flex flex-col rounded-lg bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h1
              title="view-doc-modal-header"
              className="text-sm font-medium truncate"
            >
              {file.name}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFile(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            {pdfSrc ? (
              <iframe
                src={pdfSrc}
                title={file.name}
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                This document can't be displayed.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2 text-sm">
            <AiOutlineFile className="text-muted-foreground" />
            {file.name}
          </div>
          <div>
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="icon"
              onClick={() => setShowFile(true)}
            >
              <Eye size={16} />
            </Button>
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="icon"
              onClick={deleteThisFile}
            >
              <TrashIcon size={16} />
            </Button>
          </div>
        </div>
      )}

      {deletingMessage ? <DeletingComp message={deletingMessage} /> : null}
    </>
  );
}