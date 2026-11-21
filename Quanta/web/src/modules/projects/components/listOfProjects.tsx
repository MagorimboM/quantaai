import { ProjectCard } from "@/modules/projects/components/projectCard";
import type { ProjectSummary } from "@/modules/projects/contracts/projects.response.contracts";

// The projects of the current page, or a message saying why there are none.
// `searchTerm` tells "you have no projects yet" apart from "nothing matches
// your search".
//
// The page owns the selected project and the "new project" form, so this is
// only the list: `onSelect` says which card was clicked, `onCreate` is the
// empty-state button.
export function ListOfProjects({
  projects,
  isLoading,
  searchTerm,
  selectedId,
  onSelect,
  onCreate,
}: {
  projects: ProjectSummary[];
  isLoading: boolean;
  searchTerm: string;
  selectedId: string | null;
  onSelect: (projectId: string) => void;
  onCreate: () => void;
}) {
  if (isLoading) {
    return <p className="py-6 text-sm text-[#78716C]">Loading projects...</p>;
  }

  if (projects.length === 0) {
    return (
      <div className="flex min-h-72 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#DDD6CF] bg-white/55 p-10 text-center text-[#1C1917]">
        <p className="text-sm text-[#78716C]">
          {searchTerm
            ? `No projects match "${searchTerm}".`
            : "No projects yet."}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="cursor-pointer rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(255,107,74,0.22)] transition-colors hover:bg-[#F25C3C] focus:outline-none focus:ring-[3px] focus:ring-[#FF6B4A]/15"
        >
          Create New Project
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          selected={project.id === selectedId}
          onSelect={() => onSelect(project.id)}
        />
      ))}
    </div>
  );
}