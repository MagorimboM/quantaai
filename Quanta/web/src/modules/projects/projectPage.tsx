import { AiAssistant } from "@/modules/AiAssistant/AiAssistant";
import { useState } from "react";
import { UploadModal } from "@/modules/projects/components/uploadModal";
import { SearchBar } from "@/modules/projects/components/searchBar";
import { DocumentsModal } from "@/modules/projects/components/documentModal";

import { MdOutlineUploadFile } from "react-icons/md";
import { MdOutlineNotifications } from "react-icons/md";
import { MdOutlineAccountCircle } from "react-icons/md";
import { FiFolder } from "react-icons/fi";

export function ProjectsPage() {
  const [uploadModal, setUploadModal] = useState(false);
  const [viewListOfDocuments, setViewListOfDocuments] = useState<boolean>(false);

  function toggleUploadModal() {
    setUploadModal((prev) => !prev);
  }

  function showDocuments() {
    if (viewListOfDocuments === true) {
      setViewListOfDocuments(false);
      return;
    }
    setViewListOfDocuments(true);
  }

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">

      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="max-w-md flex-1">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <button
            title="view-project-documents"
            onClick={showDocuments}
            className="
              inline-flex items-center gap-2 rounded-md border
              border-zinc-300 bg-white px-4 py-2 text-sm font-medium
              text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50
              hover:text-zinc-900 cursor-pointer
            "
          >
            <FiFolder size={18} />
            View Project Documents
          </button>

          <button
            title="project-file-upload-modal"
            onClick={toggleUploadModal}
            className="
              inline-flex items-center gap-2 rounded-md bg-zinc-900
              px-4 py-2 text-sm font-medium text-white transition-colors
              hover:bg-zinc-800 cursor-pointer
            "
          >
            <MdOutlineUploadFile size={18} />
            Upload Project Files
          </button>

          <button
            title="notifications"
            className="rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
          >
            <MdOutlineNotifications size={22} />
          </button>

          <button
            title="account"
            className="rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
          >
            <MdOutlineAccountCircle size={28} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <AiAssistant />
      </main>

      {/* Upload Modal — page tells it when to open and how to close */}
      {uploadModal === true ? (
        <UploadModal closeModal={() => setUploadModal(false)} />
      ) : null}

      {/* Documents Modal — page tells it when to open and how to close */}
      <DocumentsModal
        open={viewListOfDocuments}
        onClose={() => setViewListOfDocuments(false)}
      />

    </div>
  );
}