import { useEffect, useState } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import { ProjectCard } from "@/modules/dashboard/components/projectCard";
import { getRecentProjects } from "@/modules/dashboard/api/api";
import type { RecentProjectsResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";

// TODO :: [feature] "+ New Project" button. There is no create-project form or
// endpoint yet, so the button was removed rather than left doing nothing.

// The company's ten most recently updated projects that are not yet complete,
// so the user can jump straight back into what they were working on.
export function RecentProjects({ companyId }: { companyId: string }) {
  const [recentProjects, setRecentProjects] = useState<RecentProjectsResponse>(
    [],
  );

  useEffect(() => {
    async function loadRecentProjects() {
      try {
        const projects = await getRecentProjects({ companyId });
        setRecentProjects(projects);
      } catch {
        // apiClient already reports the failure; the list stays empty
      }
    }

    loadRecentProjects();
  }, [companyId]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-row items-center gap-2 shrink-0">
        <HiOutlineDocumentText size={20} className="text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">
          Recent Projects
        </h1>
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto">
        {recentProjects.length > 0 ? (
          recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <HiOutlineDocumentText size={32} />
            <p className="text-sm">No projects yet</p>
          </div>
        )}
      </div>
    </div>
  );
}