import { useState } from "react";
import { uploadFiles } from "@/modules/projects/api/api";

/**
 * Pick one or more files and upload them to the active project. They are saved
 * as project documents: they belong to this project, and the AI assistant uses
 * them when answering questions inside it.
 */
export function UploadModalComp({
  companyId,
  projectId,
  closeModal,
}: {
  companyId: string;
  projectId: string;
  closeModal: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  }

  async function uploadSelectedFiles() {
    if (files.length === 0 || isUploading) return;
    setError(null);
    setIsUploading(true);

    try {
      const response = await uploadFiles({
        companyId,
        projectId,
        documentType: "projectDocument",
        files,
      });

      if (response.success) {
        closeModal();
        return;
      }
      setError(response.message || "Upload failed. Please try again.");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      // Don't let a stray click close the modal mid-upload
      onClick={isUploading ? undefined : closeModal}
    >
      <div
        className="w-150 rounded-lg border bg-card p-6 text-card-foreground shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold">Upload Project Files</h2>

        <input
          title="project-file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full rounded-md border p-2"
        />

        {files.length > 0 ? (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">
              Selected Files ({files.length})
            </h3>
            <div className="max-h-48 overflow-y-auto rounded border">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="border-b p-2 text-sm last:border-b-0"
                >
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={closeModal}
            disabled={isUploading}
            className="rounded-md border px-4 py-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={uploadSelectedFiles}
            disabled={files.length === 0 || isUploading}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isUploading
              ? "Uploading..."
              : `Upload${files.length > 0 ? ` (${files.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}