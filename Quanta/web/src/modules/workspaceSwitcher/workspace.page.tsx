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

  if (workspaceId?.length > 0) {
    navigate("/dashboard");
  }

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
      const [companyWorkspaces, userWorkspace, projects] = await Promise.all([
        getWorkspaces(),
        getUserWorkspace(),
        getAllProjects(),
      ]);
      setWorkspaces(companyWorkspaces);
      setPersonalWorkspace(userWorkspace);
      setAllProjects(projects);
      setIsLoading(false);
    }

    fetchAll();
  }, []);

  const activeCompanies = useMemo(
    () =>
      workspaces.filter(
        (w) =>
          !w.isArchived && w.name.toLowerCase().includes(search.toLowerCase()),
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

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "#FFF8F0" }}
    >
      <WorkspaceSwitcherSidebar />

      <header
        className="flex-shrink-0 px-8 pt-10 pb-7"
        style={{ borderBottom: "1px solid #F3DEC0" }}
      >
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: "#2B1B0E" }}
        >
          Welcome back, {userName}.
        </h1>
        <p className="text-sm" style={{ color: "#9C7B4F" }}>
          Select a workspace to continue.
        </p>
      </header>

      {hasNoWorkspaces ? (
        <WorkspaceEmptyState
          userName={userName}
          onCreateWorkspace={() => setViewCreateCompanyWorkspace(true)}
        />
      ) : (
        <div
          className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[5fr_4fr_4fr] divide-x"
          style={{ borderColor: "#F3DEC0" }}
        >
          {/* Panel 1: Companies */}
          <div className="overflow-y-auto px-8 py-7 flex flex-col gap-5">
            <div>
              <h2
                className="text-[10px] uppercase tracking-widest font-medium mb-4"
                style={{ color: "#B89B6E" }}
              >
                Companies
              </h2>

              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Filter companies…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white rounded-md pl-9 pr-4 py-2.5 text-sm outline-none"
                  style={{ border: "1px solid #F3DEC0", color: "#2B1B0E" }}
                />
              </div>

              {isLoading ? (
                <div className="space-y-2.5">
                  <SkeletonCompanyCard />
                  <SkeletonCompanyCard />
                  <SkeletonCompanyCard />
                </div>
              ) : activeCompanies.length > 0 ? (
                <div className="space-y-2.5">
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
                <p
                  className="text-sm py-6 text-center"
                  style={{ color: "#B89B6E" }}
                >
                  {search
                    ? `No companies match "${search}"`
                    : "No company workspaces yet"}
                </p>
              )}
            </div>

            {archivedCompanies.length > 0 && !isLoading ? (
              <div className="pt-4" style={{ borderTop: "1px solid #F3DEC0" }}>
                <ToggleSwitch
                  checked={showArchived}
                  onChange={() => setShowArchived((prev) => !prev)}
                  label={`Show archived (${archivedCompanies.length})`}
                />
                {showArchived ? (
                  <div className="mt-3 space-y-2.5">
                    {archivedCompanies.map((w) => (
                      <div key={w.id} className="opacity-40">
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

            <div className="mt-auto pt-2">
              <button
                onClick={() => setViewCreateCompanyWorkspace(true)}
                className="text-white text-sm font-semibold py-2.5 px-5 rounded-md transition-colors duration-150 flex items-center gap-2 cursor-pointer"
                style={{ background: "#FF6B35" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#E85A26")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#FF6B35")
                }
              >
                <PlusIcon />
                Create New Workspace
              </button>
            </div>
          </div>

          {/* Panel 2: Personal */}
          <div className="overflow-y-auto px-8 py-7">
            <h2
              className="text-[10px] uppercase tracking-widest font-medium mb-4"
              style={{ color: "#B89B6E" }}
            >
              Personal
            </h2>
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
              <p className="text-sm" style={{ color: "#B89B6E" }}>
                No personal workspace yet.
              </p>
            )}
          </div>

          {/* Panel 3: All projects */}
          <div className="overflow-y-auto px-8 py-7 flex flex-col">
            <div className="flex items-baseline justify-between mb-4">
              <h2
                className="text-[10px] uppercase tracking-widest font-medium"
                style={{ color: "#B89B6E" }}
              >
                All Projects
              </h2>
              <span className="text-[10px]" style={{ color: "#B89B6E" }}>
                by due date
              </span>
            </div>

            {isLoading ? (
              <>
                <SkeletonProjectRow />
                <SkeletonProjectRow />
                <SkeletonProjectRow />
                <SkeletonProjectRow />
              </>
            ) : allProjects.length > 0 ? (
              <div className="flex-1">
                {allProjects.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <p
                className="text-sm py-6 text-center"
                style={{ color: "#B89B6E" }}
              >
                No active projects.
              </p>
            )}
          </div>
        </div>
      )}

      {viewCreateCompanyWorkspaceForm ? (
        <CreateCompanyWorkspaceForm
          onClose={() => setViewCreateCompanyWorkspace(false)}
        />
      ) : null}
    </div>
  );
}
