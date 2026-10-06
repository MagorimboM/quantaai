import { useEffect, useState } from "react";
import { AiOutlineFile } from "react-icons/ai";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getFiles } from "@/modules/projects/api/api";
import { ViewFileModalComp } from "@/modules/projects/components/viewFileModalComp";
import type {
  DocumentType,
  GetFilesResponse,
} from "@/modules/projects/contracts/projects.response.contracts";

// The three shelves of documents, in the order they are shown
const DOCUMENT_GROUPS: { type: DocumentType; title: string }[] = [
  { type: "companyDocument", title: "Company Documents" },
  { type: "projectDocument", title: "Project Documents" },
  { type: "userDocument", title: "Personal Documents" },
];

/**
 * Lists every document the user can use for a project, grouped by shelf:
 * company documents, this project's documents, and personal documents. These
 * are the same documents the AI assistant reads. Each can be opened or deleted.
 *
 * TODO :: [backend] The list carries every file's full bytes in one response.
 * It should send a link per document and load the file only when it is opened.
 */
export function FileModalComp({
  open,
  companyId,
  projectId,
  onClose,
}: {
  open: boolean;
  companyId: string;
  projectId: string;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<GetFilesResponse>([]);

  // Load when opened, not when the page loads: the list is then fresh after an
  // upload or delete, and nothing is downloaded until someone asks to see it.
  useEffect(() => {
    if (!open) return;

    async function fetchDocuments() {
      try {
        setFiles(await getFiles({ companyId, projectId }));
      } catch {
        // apiClient already reports the failure; the list keeps what it had
      }
    }

    fetchDocuments();
  }, [open, companyId, projectId]);

  // Stop the page behind from scrolling while the modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Called by a row after the backend has deleted its file
  function removeFromList(documentId: string) {
    setFiles((prev) => prev.filter((item) => item.document.id !== documentId));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Project Documents</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="overflow-y-auto px-6 py-4">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <AiOutlineFile size={32} />
              <p className="text-sm">No documents found</p>
            </div>
          ) : (
            <div title="docs-container" className="flex flex-col gap-4">
              {DOCUMENT_GROUPS.map((group, index) => {
                const groupFiles = files.filter(
                  (item) => item.document.documentType === group.type,
                );

                return (
                  <div key={group.type} className="flex flex-col gap-4">
                    {index > 0 ? <Separator /> : null}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.title}
                      </p>
                      {groupFiles.length > 0 ? (
                        groupFiles.map(({ document: file, bytes }) => (
                          <ViewFileModalComp
                            key={file.id}
                            file={file}
                            bytes={bytes}
                            companyId={companyId}
                            projectId={projectId}
                            onDeleted={removeFromList}
                          />
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">None</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}