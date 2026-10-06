import { ProjectCard } from "@/modules/projects/components/projectCard";
import type { ProjectSummary } from "@/modules/projects/contracts/projects.response.contracts"

// The projects of the current page, or a message saying why there are none.
// `searchTerm` tells "you have no projects yet" apart from "nothing matches
// your search".
export function ListOfProjects({
  projects,
  isLoading,
  searchTerm,
}: {
  projects: ProjectSummary[];
  isLoading: boolean;
  searchTerm: string;
}) {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col">
      <div className="flex flex-col gap-4 p-4">
        <h1 className="font-bold text-2xl">Projects</h1>
        <p>Manage your quantity take offs</p>
      </div>
      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {searchTerm
              ? `No projects match "${searchTerm}".`
              : "No projects yet."}
          </p>
        )}
      </div>
    </div>
  );
}