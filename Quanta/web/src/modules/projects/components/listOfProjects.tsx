import { ProjectCard } from "@/modules/projects/components/projectCard";

type ProjectSummary = {
  companyId: string | null;
  createdAt: Date;
  description: string | null;
  id: string;
  name: string;
  status: string;
  takeoffItems: {
    description: string;
    id: string;
    projectId: string;
  }[];
  type: string;
  updatedAt: Date;
};

// TODO :: create contracts of these pages

export function ListOfProjects({
  projects,
  isLoading,
}: {
  projects: ProjectSummary[];
  isLoading: boolean;
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
            <ProjectCard
              key={project.id}
              name={project.name}
              type={project.type}
              status={project.status}
              numberOfLineItems={project.takeoffItems.length}
              companyId={project.companyId}
              time={project.updatedAt}
              projectId={project.id}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nothing found</p>
        )}
      </div>
    </div>
  );
}