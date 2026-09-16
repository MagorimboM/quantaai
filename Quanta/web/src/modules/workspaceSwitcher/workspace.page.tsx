import { useEffect, useState } from "react";
import { PersonalWorkSpaceCard } from "@/modules/workspaceSwitcher/components/personalCard";
import { CompanyWorkSpaceCard } from "@/modules/workspaceSwitcher/components/companyWorkspacesCard";
import { CreateCompanyWorkspaceForm } from "@/modules/workspaceSwitcher/components/createCompanyWorkspace.form";
import { WorkspaceSwitcherSidebar } from "@/modules/workspaceSwitcher/components/workspaceSwitcherSidebar";
import {
  getWorkspaces,
  getUserWorkspace,
  postNewWorkspace
} from "@/modules/workspaceSwitcher/api/api";


export function WorkspaceSwitcherPage() {
  // TODO :: check if the user has workspace id in the localStorage, if so then navigate them to the dashboard.
  // TODO :: if user workspace has no id then show the create personal workspaces.
  // TODO :: onclick navigate to workspace. Page.

  const [workspaces, setWorkspaces] = useState<
    {
      id: string;
      name: string;
      numberOfProjects: number;
      numberOfRecipes: number;
    }[]
  >([]);

  const [personalWorkspace, setPersonalWorkspace] = useState<{
    id: string;
    name: string;
    numberOfProjects: number;
    numberOfRecipes: number;
  }>({
    id: "",
    name: "",
    numberOfProjects: 0,
    numberOfRecipes: 0,
  });

  const [viewCreateCompanyWorkspaceForm, setViewCreateCompanyWorkspace] =
    useState<boolean>(false);

  useEffect(() => {
    async function fetchWorkspaces() {
      const companyWorkspaces = await getWorkspaces();
      const userWorkspace = await getUserWorkspace();
      setWorkspaces(companyWorkspaces);
      setPersonalWorkspace(userWorkspace);
    }

    fetchWorkspaces();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full">
        <WorkspaceSwitcherSidebar />
        <div className="flex flex-col w-full p-8 bg-background text-foreground">
          <header className="flex flex-col w-full items-center-safe">
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome back, {`${"User"}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              Select a workspace to continue
            </p>
          </header>
          <main className="w-full flex flex-col gap-8">
            <div
              title="personal-workspace-card"
              className="flex flex-col gap-4 w-full rounded-lg"
            >
              <div className="w-full items-center flex flex-row">
                <h1 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Personal
                </h1>
              </div>
              <PersonalWorkSpaceCard
                numberOfProjects={personalWorkspace.numberOfProjects}
                numberOfRecipes={personalWorkspace.numberOfRecipes}
                lastActivity="30 min ago"
              />
            </div>
            <div
              title="personal-workspace-card"
              className="flex flex-col gap-4 w-full rounded-lg"
            >
              <div className="w-full items-center flex flex-row">
                <h1 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Company Workspaces
                </h1>
              </div>
              <div className="w-full overflow-y-auto grid grid-cols-3 gap-4">
                {workspaces.length > 0
                  ? workspaces.map((workspace, key) => (
                      <CompanyWorkSpaceCard
                        key={key}
                        companyName={workspace.name}
                        numberOfProjects={workspace.numberOfProjects}
                        numberOfRecipes={workspace.numberOfRecipes}
                        lastActivity="30 min ago"
                      />
                    ))
                  : null}
              </div>
            </div>
            <button
              onClick={() => setViewCreateCompanyWorkspace(true)}
              className="w-full p-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground transition-all duration-300 ease-in-out hover:bg-primary/90 active:scale-95 cursor-pointer"
            >
              + Create New Workspace
            </button>
          </main>
        </div>
      </div>

      {viewCreateCompanyWorkspaceForm == true ? (
        <CreateCompanyWorkspaceForm
          onClose={() => setViewCreateCompanyWorkspace(false)}
        />
      ) : null}
    </>
  );
}
