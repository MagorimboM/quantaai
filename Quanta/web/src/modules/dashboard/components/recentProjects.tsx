import { useEffect, useState } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import { ProjectCard } from "@/modules/dashboard/components/projectCard";
import { getRecentProjects } from "@/modules/dashboard/api/api";
import type { RecentProjectsResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";

// TODO :: [feature] "+ New Project" button. There is no create-project flow on
// the dashboard yet, so the button isn't shown.

// Loads the company's ten most recently updated projects that are not yet
// complete. The dashboard page calls this once and shares the result with the
// "continue taking off" banner and the list, so the projects load only once.
export function useRecentProjects(companyId: string) {
  const [projects, setProjects] = useState<RecentProjectsResponse>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRecentProjects() {
      setIsLoading(true);
      try {
        setProjects(await getRecentProjects({ companyId }));
      } catch {
        // apiClient already reports the failure; the list stays empty
      } finally {
        setIsLoading(false);
      }
    }

    loadRecentProjects();
  }, [companyId]);

  return { projects, isLoading };
}

// "Recently touched": the projects to jump straight back into
export function RecentProjects({
  projects,
  isLoading,
}: {
  projects: RecentProjectsResponse;
  isLoading: boolean;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-4 rounded-2xl border border-[#EFECE6] bg-white p-5 shadow-[0_10px_32px_rgba(67,50,38,0.055)]">
      <div className="shrink-0">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#1C1917]">
          Recently Touched
        </h2>
        <p className="mt-0.5 text-[12px] text-[#A8A29E]">
          Pick up where you left off.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[72px] w-full animate-pulse rounded-xl bg-[#F5F3EF]"
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-[#A8A29E]">
            <HiOutlineDocumentText size={32} />
            <p className="text-sm text-[#78716C]">No projects yet</p>
          </div>
        )}
      </div>
    </section>
  );
}