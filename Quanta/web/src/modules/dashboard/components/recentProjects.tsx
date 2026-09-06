import { ProjectCard } from "@/modules/dashboard/components/projectCard";
import { HiOutlineDocumentText } from "react-icons/hi";
import { useEffect, useState } from "react";
import type { RecentProjectsResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";
import { getRecentProjects } from "@/modules/dashboard/api/api";

// TODO :: create new project form modal, wire it a the backend
// TODO :: wire the dashboard to the backend

export function RecentProjects() {
  const [recentProjects, setRecentProjects] = useState<RecentProjectsResponse>(
    [],
  );

  useEffect(() => {
    async function projects() {
      const recentProjects = await getRecentProjects({
        companyId: "seed-company-001",
      });
      setRecentProjects(recentProjects);
    }

    projects();
  }, []);

  return (
    <div className="flex flex-col gap-6 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-1 flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <HiOutlineDocumentText size={20} className="text-muted-foreground" />
          <h1 className="text-lg font-semibold text-foreground">
            Recent Projects
          </h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer">
          + New Project
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {recentProjects.length > 0 ? (
          recentProjects.map((project, key) => (
            <ProjectCard
              key={key}
              name={project.name}
              status={project.status}
              type={project.type}
              companyId={project.companyId}
              projectId={project.id}
            />
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
