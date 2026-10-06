import { useEffect, useState } from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import { FiFolder } from "react-icons/fi";
import { AiAssistant } from "@/modules/aiAssistant/AiAssistant";
import { UploadModalComp } from "@/modules/projects/components/uploadModalComp";
import { SearchBarComp } from "@/modules/projects/components/searchBarComp";
import { FileModalComp } from "@/modules/projects/components/fileModalComp";
import { ListOfProjects } from "@/modules/projects/components/listOfProjects";
import { getListOfProjects } from "@/modules/projects/api/api";
import type { ProjectSummary } from "@/modules/projects/contracts/projects.response.contracts";
import { getActiveScope } from "@/common/storage/activeScope";

const PAGE_SIZE = 10;

/**
 * The list of the company's projects, each one a quantity takeoff. The user
 * can search them, page through them, and click one to open its takeoff.
 *
 * The page is about one company, so a personal workspace (no company) shows a
 * message instead. TODO :: [backend] personal projects (no company), then drop it.
 *
 * Documents: the "View" and "Upload" buttons act on a project's documents, so
 * they only appear when a project is active (the last one the user opened).
 * TODO :: [design] On a list there is no obvious "current project", so these
 * act on whichever was opened last. Consider moving them (and the assistant)
 * onto the takeoff page, where the project is unambiguous.
 */
export function ProjectsPage() {
  const { companyId, projectId } = getActiveScope();

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showDocuments, setShowDocuments] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function loadProjects(term: string, page: number) {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const response = await getListOfProjects({
        companyId,
        term,
        page,
        limit: PAGE_SIZE,
      });
      setProjects(response.projects);
      setTotalCount(response.totalCount);
    } catch {
      // apiClient already reports the failure; the list keeps what it had
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects("", 1);
  }, [companyId]);

  // A new search always starts from the first page
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

  if (!companyId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Select a company workspace to see its projects.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="max-w-md flex-1">
          <SearchBarComp onSearch={handleSearch} />
        </div>

        {projectId ? (
          <div className="flex items-center gap-2">
            <button
              title="view-project-documents"
              onClick={() => setShowDocuments(true)}
              className="inline-flex items-center gap-2 rounded-md border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/70 cursor-pointer"
            >
              <FiFolder size={18} />
              View Project Documents
            </button>

            <button
              title="project-file-upload-modal"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
            >
              <MdOutlineUploadFile size={18} />
              Upload Project Files
            </button>
          </div>
        ) : null}
      </header>

      {/* Main Content */}
      <main className="flex flex-1 min-h-0 w-full flex-col">
        <ListOfProjects
          projects={projects}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />

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

      {/* The page decides when each modal is open and how it closes */}
      {showUploadModal && projectId ? (
        <UploadModalComp
          companyId={companyId}
          projectId={projectId}
          closeModal={() => setShowUploadModal(false)}
        />
      ) : null}
      {projectId ? (
        <FileModalComp
          open={showDocuments}
          companyId={companyId}
          projectId={projectId}
          onClose={() => setShowDocuments(false)}
        />
      ) : null}
    </div>
  );
}