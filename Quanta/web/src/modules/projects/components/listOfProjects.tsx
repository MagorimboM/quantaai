import { ProjectCard } from "@/modules/projects/components/projectCard";
import type { ProjectSummary } from "@/modules/projects/contracts/projects.response.contracts";
import { useState } from "react";
import { NewProjectForm } from "@/modules/projects/components/newProject.form";
// The projects of the current page, or a message saying why there are none.
// `searchTerm` tells "you have no projects yet" apart from "nothing matches
// your search".
export function ListOfProjects({
  editProjectList,
  projects,
  isLoading,
  searchTerm,
}: {
  editProjectList: (project: ProjectSummary) => void;
  projects: ProjectSummary[];
  isLoading: boolean;
  searchTerm: string;
}) {
  const [showNewProjectForm, setShowNewProjectForm] = useState<boolean>(false);

  function closeFormModal() {
    setShowNewProjectForm(false);
  }

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-1 p-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your quantity take offs
          </p>
        </div>
        {projects.length > 0 ? (
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="mr-4 cursor-pointer self-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Create New Project
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="flex w-full flex-col items-center gap-4 rounded-lg border border-dashed bg-card p-10 text-center text-card-foreground">
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? `No projects match "${searchTerm}".`
                : "No projects yet."}
            </p>
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {" "}
              Create New Project
            </button>
          </div>
        )}

        {showNewProjectForm ? (
          <NewProjectForm
            addToProjectList={editProjectList}
            onClose={closeFormModal}
          />
        ) : null}
      </div>
    </div>
  );
}
