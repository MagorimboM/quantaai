import { useEffect, useState } from "react";
import { MdAdd, MdOutlineFolderCopy } from "react-icons/md";
import { SearchBarComp } from "@/modules/projects/components/searchBarComp";
import { ListOfProjects } from "@/modules/projects/components/listOfProjects";
import { ProjectDetailCard } from "@/modules/projects/components/projectDetailCard";
import { NewProjectForm } from "@/modules/projects/components/newProject.form";
import { getListOfProjects } from "@/modules/projects/api/api";
import type { ProjectSummary } from "@/modules/projects/contracts/projects.response.contracts";
import { getActiveScope } from "@/common/storage/activeScope";
const PAGE_SIZE = 10;

/**
 * The list of the company's projects, each one a quantity takeoff. The user
 * can search them, page through them, select one to see its details, and open
 * its takeoff.
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState<boolean>(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Until one is clicked (or if the selected one is no longer on this page),
  // the first project on the page is the selected one
  const selectedProject =
    projects.find((project) => project.id === selectedId) ??
    projects[0] ??
    null;

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

  function editProjectSummary(project: ProjectSummary) {
    setProjects((prev) => [...prev, project]);
    setSelectedId(project.id);
  }

  if (!companyId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#FAF8F5] p-4">
        <p className="text-sm text-[#78716C]">
          Select a company workspace to see its projects.
        </p>
      </div>
    );
  }

  const pageButton =
    "cursor-pointer rounded-lg border border-[#EFECE6] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1917] transition-colors hover:border-[#FFC6B5] hover:bg-[#FFF6F1] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex h-full w-full flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#EBE7E1] bg-white/85 px-6 py-3.5 backdrop-blur">
        <div className="flex items-center gap-3.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#25211E] text-white shadow-[0_6px_16px_rgba(37,33,30,0.16)]">
            <MdOutlineFolderCopy size={20} />
          </span>
          <span className="h-7 w-px bg-[#E4DFD9]" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] leading-none text-[#9B938D]">
              Quantity takeoff
            </span>
            <h1 className="text-xl font-semibold leading-none tracking-tight text-[#1C1917]">
              Projects
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewProjectForm(true)}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B4A] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,74,0.24)] transition-all hover:-translate-y-px hover:bg-[#F25C3C] focus:outline-none focus:ring-[3px] focus:ring-[#FF6B4A]/15"
        >
          <MdAdd size={18} />
          New Project
        </button>
      </header>

      {/* Main Content */}
      <main className="flex min-h-0 w-full flex-1 flex-col gap-5 px-6 pt-5 pb-4">
        <div className="shrink-0">
          <SearchBarComp onSearch={handleSearch} />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.86fr)_minmax(320px,1fr)] gap-4">
          <section className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-3 flex shrink-0 items-start justify-between px-0.5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] leading-none text-[#A09992]">
                  Project library
                </span>
                <h2 className="text-lg font-semibold leading-none tracking-tight">
                  Active Projects
                </h2>
              </div>
              <span className="mt-1 rounded-full border border-[#E9E4DF] bg-white/60 px-2.5 py-1 text-xs font-semibold text-[#7F7771]">
                {totalCount} project{totalCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-1">
              <ListOfProjects
                projects={projects}
                isLoading={isLoading}
                searchTerm={searchTerm}
                selectedId={selectedProject?.id ?? null}
                onSelect={setSelectedId}
                onCreate={() => setShowNewProjectForm(true)}
              />
            </div>

            {totalCount > 0 ? (
              <div className="mt-3 flex shrink-0 items-center justify-between rounded-xl border border-[#EFECE6] bg-white px-4 py-2.5">
                <p className="text-xs text-[#78716C]">
                  Page {currentPage} of {totalPages} — {totalCount} project
                  {totalCount === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={pageButton}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={pageButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <ProjectDetailCard project={selectedProject} />
        </div>
      </main>

      {showNewProjectForm ? (
        <NewProjectForm
          addToProjectList={editProjectSummary}
          onClose={() => setShowNewProjectForm(false)}
        />
      ) : null}
    </div>
  );
}