import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/react";
import { PersonalWorkSpaceCard } from "@/modules/workspaceSwitcher/components/personalCard";
import { CompanyWorkSpaceCard } from "@/modules/workspaceSwitcher/components/companyWorkspacesCard";
import { CreateCompanyWorkspaceForm } from "@/modules/workspaceSwitcher/components/createCompanyWorkspace.form";
import { WorkspaceSwitcherSidebar } from "@/modules/workspaceSwitcher/components/workspaceSwitcherSidebar";
import { ProjectRow } from "@/modules/workspaceSwitcher/components/projectRow";
import { ToggleSwitch } from "@/modules/workspaceSwitcher/components/toggleSwitch";
import { WorkspaceEmptyState } from "@/modules/workspaceSwitcher/components/workspaceEmptyState";
import {
  SkeletonCompanyCard,
  SkeletonPersonalCard,
  SkeletonProjectRow,
} from "@/modules/workspaceSwitcher/components/workspaceSwitcherSkeleton";
import {
  SearchIcon,
  PlusIcon,
} from "@/modules/workspaceSwitcher/components/workspaceSwitcherIcons";
import type {
  CompanyWorkspace,
  PersonalWorkspace,
  ProjectSummary,
} from "@/modules/workspaceSwitcher/contracts/workspaceSwitcher.types";
import {
  getWorkspaces,
  getUserWorkspace,
  getAllProjects,
} from "@/modules/workspaceSwitcher/api/api";

export function WorkspaceSwitcherPage() {
  const { user } = useUser();
  const userName = user?.firstName ?? "there";
  const navigate = useNavigate();
  const workspaceId: any = localStorage.getItem("workspaceId");

  console.log(import.meta.env.VITE_API_URL);

  useEffect(() => {
    if (workspaceId) {
      navigate("/dashboard");
    }
  }, []);

  const [workspaces, setWorkspaces] = useState<CompanyWorkspace[]>([]);
  const [personalWorkspace, setPersonalWorkspace] =
    useState<PersonalWorkspace | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectSummary[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [viewCreateCompanyWorkspaceForm, setViewCreateCompanyWorkspace] =
    useState(false);

  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);
      try {
        const [companyWorkspaces, userWorkspace, projects] = await Promise.all([
          getWorkspaces(),
          getUserWorkspace(),
          getAllProjects(),
        ]);

        // The lists must be real arrays. Anything else means the server answered
        // with something unexpected, so show an empty list instead of crashing.
        if (!Array.isArray(companyWorkspaces)) {
          console.error(
            "Expected a list of workspaces, got:",
            companyWorkspaces,
          );
        }
        setWorkspaces(
          Array.isArray(companyWorkspaces) ? companyWorkspaces : [],
        );
        setPersonalWorkspace(userWorkspace);
        setAllProjects(Array.isArray(projects) ? projects : []);
      } catch {
        // apiClient already reports the failure
      } finally {
        setIsLoading(false);
      }
    }

    fetchAll();
  }, []);

  const activeCompanies = useMemo(
    () =>
      workspaces.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [workspaces, search],
  );
  const archivedCompanies = useMemo(
    () => workspaces.filter((w) => w.isArchived),
    [workspaces],
  );

  const hasNoWorkspaces =
    !isLoading &&
    workspaces.length === 0 &&
    (!personalWorkspace || personalWorkspace.id === "");
  function addNewWorkspace(company: any) {
    setWorkspaces((prev) => [...prev, company]);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-[#1C1917] antialiased">
      <WorkspaceSwitcherSidebar />

      <header className="flex-shrink-0 px-10 pt-10 pb-2">
        <h1 className="mb-2 text-[28px] font-semibold leading-[1.12] tracking-[-0.035em] text-[#1C1917]">
          Welcome back, {userName}.
        </h1>
        <p className="text-sm text-[#78716C]">Select a workspace to continue.</p>
      </header>

      {hasNoWorkspaces ? (
        <WorkspaceEmptyState
          userName={userName}
          onCreateWorkspace={() => setViewCreateCompanyWorkspace(true)}
        />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-10 px-10 pt-8 pb-10 lg:grid-cols-[5fr_4fr_4fr]">
          {/* Panel 1 */}
          <div className="flex h-full min-h-0 flex-col">
            {/* Fixed: heading + search */}
            <div className="flex-shrink-0">
              <h2 className="mb-4 text-xs font-medium text-[#78716C]">
                Companies
              </h2>

              <div className="relative mb-4">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Filter companies…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-transparent bg-[#FAFAF9] pl-9 pr-3 text-sm text-[#1C1917] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[#A8A29E] focus:border-[#FF6B35] focus:bg-white focus:ring-[3px] focus:ring-[#FFF4EE]"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  <SkeletonCompanyCard />
                  <SkeletonCompanyCard />
                  <SkeletonCompanyCard />
                </div>
              ) : activeCompanies.length > 0 ? (
                <div className="space-y-2">
                  {activeCompanies.map((w) => (
                    <CompanyWorkSpaceCard
                      key={w.id}
                      id={w.id}
                      companyId={w.companyId}
                      companyName={w.name}
                      numberOfProjects={w.numberOfProjects}
                      numberOfRecipes={w.numberOfRecipes}
                      lastActivity={w.lastActivity}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-[13px] text-[#A8A29E]">
                  {search
                    ? `No companies match "${search}"`
                    : "No company workspaces yet"}
                </p>
              )}

              {archivedCompanies.length > 0 && !isLoading ? (
                <div className="mt-5">
                  <ToggleSwitch
                    checked={showArchived}
                    onChange={() => setShowArchived((prev) => !prev)}
                    label={`Show archived (${archivedCompanies.length})`}
                  />
                  {showArchived ? (
                    <div className="mt-3 space-y-2">
                      {archivedCompanies.map((w) => (
                        <div key={w.id} className="opacity-60">
                          <CompanyWorkSpaceCard
                            id={w.id}
                            companyId={w.companyId}
                            companyName={w.name}
                            numberOfProjects={w.numberOfProjects}
                            numberOfRecipes={w.numberOfRecipes}
                            lastActivity={w.lastActivity}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex-shrink-0 pt-5">
              <button
                onClick={() => setViewCreateCompanyWorkspace(true)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#FF6B35] bg-[#FF6B35] px-4 text-sm font-medium text-white transition-colors duration-150 hover:border-[#E85A26] hover:bg-[#E85A26] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FFF4EE]"
              >
                <PlusIcon />
                Create New Workspace
              </button>
            </div>
          </div>

          {/* Panel 2: Personal */}
          <div className="flex h-full min-h-0 flex-col">
            <h2 className="mb-4 flex-shrink-0 text-xs font-medium text-[#78716C]">
              Personal
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <SkeletonPersonalCard />
              ) : personalWorkspace && personalWorkspace.id ? (
                <PersonalWorkSpaceCard
                  id={personalWorkspace.id}
                  numberOfProjects={personalWorkspace.numberOfProjects}
                  numberOfRecipes={personalWorkspace.numberOfRecipes}
                  lastActivity={personalWorkspace.lastActivity}
                />
              ) : (
                <p className="text-[13px] text-[#A8A29E]">
                  No personal workspace yet.
                </p>
              )}
            </div>
          </div>

          {/* Panel 3: All projects */}
          <div className="flex h-full min-h-0 flex-col">
            <div className="mb-4 flex flex-shrink-0 items-baseline justify-between">
              <h2 className="text-xs font-medium text-[#78716C]">
                All Projects
              </h2>
              <span className="text-xs text-[#A8A29E]">by due date</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#F0EDE8]">
              {isLoading ? (
                <>
                  <SkeletonProjectRow />
                  <SkeletonProjectRow />
                  <SkeletonProjectRow />
                  <SkeletonProjectRow />
                </>
              ) : allProjects.length > 0 ? (
                allProjects.map((p) => <ProjectRow key={p.id} project={p} />)
              ) : (
                <p className="py-10 text-center text-[13px] text-[#A8A29E]">
                  No active projects.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {viewCreateCompanyWorkspaceForm ? (
        <CreateCompanyWorkspaceForm
          onClose={() => setViewCreateCompanyWorkspace(false)}
          addToList={addNewWorkspace}
        />
      ) : null}
    </div>
  );
}