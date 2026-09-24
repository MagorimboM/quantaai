import { AiAssistant } from "@/modules/aiAssistant/AiAssistant";
import { useState, useEffect } from "react";
import { UploadModalComp } from "@/modules/projects/components/uploadModalComp";
import { SearchBarComp } from "@/modules/projects/components/searchBarComp";
import { FileModalComp } from "@/modules/projects/components/fileModalComp";
import { MdOutlineUploadFile } from "react-icons/md";
import { FiFolder } from "react-icons/fi";
import { ListOfProjects } from "@/modules/projects/components/listOfProjects";
import { getListOfProjects } from "@/modules/projects/api/api";

// TODO :: implement view library
// TODO :: implement view Quantities (big one here)

const PAGE_SIZE = 10;

export function ProjectsPage() {
  const [uploadModal, setUploadModal] = useState(false);
  const [viewListOfDocuments, setViewListOfDocuments] =
    useState<boolean>(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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

  async function loadProjects(term: string, page: number) {
    setIsLoading(true);
    // TODO :: get userId from the verified session, not hardcoded
    const response = await getListOfProjects({
      companyId: "seed-company-001",
      userId: "seed-user-001",
      term: term,
      page: page,
      limit: PAGE_SIZE,
    });
    setProjects(response.projects);
    setTotalCount(response.totalCount);
    setIsLoading(false);
  }

  useEffect(() => {
    loadProjects("", 1);
  }, []);

  function handleSearch(term: string) {
    setSearchTerm(term);
    setCurrentPage(1);
    loadProjects(term, 1);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadProjects(searchTerm, page);
  }

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="max-w-md flex-1">
          <SearchBarComp onSearch={handleSearch} />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900
              px-4 py-2 text-sm font-medium text-white transition-colors
              hover:bg-zinc-800 cursor-pointer
            "
          >
            {" "}
            View Library{" "}
          </button>
          <button
            title="view-project-documents"
            onClick={() => showDocuments()}
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
            onClick={() => toggleUploadModal()}
            className="
              inline-flex items-center gap-2 rounded-md bg-zinc-900
              px-4 py-2 text-sm font-medium text-white transition-colors
              hover:bg-zinc-800 cursor-pointer
            "
          >
            <MdOutlineUploadFile size={18} />
            Upload Project Files
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 min-h-0 w-full flex-col">
        <ListOfProjects projects={projects} isLoading={isLoading} />

        {totalCount > 0 ? (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages} — {totalCount} project
              {totalCount === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-md border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-md border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        <AiAssistant />
      </main>
      {/* Upload Modal — page tells it when to open and how to close */}
      {uploadModal === true ? (
        <UploadModalComp closeModal={() => setUploadModal(false)} />
      ) : null}
      {/* Documents Modal — page tells it when to open and how to close */}
      <FileModalComp
        open={viewListOfDocuments}
        onClose={() => setViewListOfDocuments(false)}
      />
    </div>
  );
}