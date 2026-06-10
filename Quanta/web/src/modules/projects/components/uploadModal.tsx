import { useState } from "react";

type UploadModalProps = {
  closeModal: () => void;
};

export function UploadModal({ closeModal }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    setFiles(Array.from(e.target.files));
  }

  function uploadFiles() {
    console.log(files);
  }

  // create a modal that shows the number of files that has been created... 


  

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={()=>(closeModal())}
    >
      <div
        className="w-[600px] rounded-lg border bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold">Upload Project Files</h2>

        <input
          title="project-file-upload"
          type="file"
          multiple
          onChange={(e) => handleFileChange(e)}
          className="w-full rounded-md border p-2"
        />

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">
              Selected Files ({files.length})
            </h3>

            <div className="max-h-48 overflow-y-auto rounded border">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="border-b p-2 text-sm last:border-b-0"
                >
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={()=>(closeModal())}
            className="rounded-md border px-4 py-2 hover:bg-zinc-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => uploadFiles()}
            disabled={files.length === 0}
            className="
              rounded-md
              bg-zinc-900
              px-4
              py-2
              text-white
              hover:bg-zinc-800
              disabled:cursor-not-allowed
              disabled:opacity-50
              cursor-pointer
            "
          >
            Upload {files.length > 0 ? `(${files.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
