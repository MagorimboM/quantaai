import { useState } from "react";
import { uploadFiles } from "@/modules/projects/api/api";

/**
 * Pick one or more files and upload them to the active project. They are saved
 * as project documents: they belong to this project, and the AI assistant uses
 * them when answering questions inside it.
 */

// TODO :: then concept now is to upload project document spec... 
// TODO :: Atn the begining to upload company policy
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30 backdrop-blur-sm"
      // Don't let a stray click close the modal mid-upload
      onClick={isUploading ? undefined : closeModal}
    >
      <div
        className="w-150 rounded-2xl border border-[#EFECE6] bg-white p-6 text-[#1C1917] shadow-[0_25px_70px_rgba(40,29,23,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Upload Project Files
        </h2>

        <input
          title="project-file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full rounded-xl border border-dashed border-[#FFD1C4] bg-[#FFF7ED]/60 p-3 text-sm text-[#78716C] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#FF6B4A] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-[#F25C3C]"
        />

        {files.length > 0 ? (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-[#1C1917]">
              Selected Files ({files.length})
            </h3>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#EFECE6]">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="border-b border-[#F0EDE9] p-2.5 text-sm text-[#1C1917] last:border-b-0"
                >
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-2 border-t border-[#EEEAE5] pt-4">
          <button
            onClick={closeModal}
            disabled={isUploading}
            className="cursor-pointer rounded-lg border border-[#E7E2DC] bg-white px-4 py-2 text-sm font-semibold text-[#746C66] transition-colors hover:border-[#FFC6B5] hover:bg-[#FFF6F1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            onClick={uploadSelectedFiles}
            disabled={files.length === 0 || isUploading}
            className="cursor-pointer rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(255,107,74,0.22)] transition-colors hover:bg-[#F25C3C] focus:outline-none focus:ring-[3px] focus:ring-[#FF6B4A]/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
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