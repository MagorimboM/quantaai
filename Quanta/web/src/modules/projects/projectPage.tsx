import { useEffect, useState } from "react";
import { SearchBarComp } from "@/modules/projects/components/searchBarComp";
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
 * Documents and the AI assistant are not here: they act on one project, and a
 * list has no single "current project". They live on the takeoff page, where
 * the project is unambiguous.
 */
export function ProjectsPage() {
  const { companyId } = getActiveScope();

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
      console.log(response)
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

  function editProjectSummary(project: ProjectSummary) {
    setProjects((prev) => [...prev, project]);
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

      </header>

      {/* Main Content */}
      <main className="flex flex-1 min-h-0 w-full flex-col">
        <ListOfProjects
          projects={projects}
          isLoading={isLoading}
          searchTerm={searchTerm}
          editProjectList={editProjectSummary}
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

      </main>

    </div>
  );
}