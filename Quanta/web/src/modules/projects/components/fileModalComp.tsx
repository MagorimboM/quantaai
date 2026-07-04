import { getFiles } from "@/modules/projects/api/api";
import { useState, useEffect } from "react";
import { ViewFileModalComp } from "@/modules/projects/components/viewFileModalComp";
import { AiOutlineFile } from "react-icons/ai";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  FileModalProps,
  Documents,
} from "@/modules/projects/contracts/fileModal.contract";

// TODO :: Replace Dummy Data with real-time data

const DUMMY_DATA = {
  projectId: "seed-proj-001",
  documentId: "seed-doc-001",
  companyId: "seed-company-001",
};

export function FileModalComp({ open, onClose }: FileModalProps) {
  const [documents, setDocuments] = useState<Documents[]>([]);

  useEffect(() => {
    async function fetchDocuments() {
      const files = await getFiles({
        projectId: DUMMY_DATA.projectId,
        companyId: DUMMY_DATA.companyId,
      });
      setDocuments(files);
    }
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  // TODO :: double check component orchestrator 
  // TODO :: rename data structure " got to fix that document.document nonsense"

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
          <div title="docs-container" className="flex flex-col gap-4">
            {/* company documents */}
            <div title="company-docs" className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Company Documents
              </p>
              {documents.map((document) => {
                if (document.document.documentType === "companyDocument") {
                  return (
                    <ViewFileModalComp
                      bytes={document.bytes}
                      key={document.document.id}
                      document={document.document}
                    />
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
                    <ViewFileModalComp
                      key={document.document.id}
                      bytes={document.bytes}
                      document={document.document}
                    />
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
                    <ViewFileModalComp
                      key={document.document.id}
                      bytes={document.bytes}
                      document={document.document}
                    />
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
        </div>
      </div>
    </div>
  );
}
