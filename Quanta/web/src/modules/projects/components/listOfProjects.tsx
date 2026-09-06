import { useEffect, useState } from "react";
import { getListOfProjects } from "@/modules/projects/api/api";
import { ProjectCard } from "@/modules/projects/components/projectCard";

// TODO:: fix the scroll of the list
// TODO :: create contracts of these pages

export function ListOfProjects() {
  const [listofProjects, setListOfprojects] = useState<
    {
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
    }[]
  >([]);

  useEffect(() => {
    async function getProjectsList() {
      const result = await getListOfProjects({ companyId: "seed-company-002" });
      setListOfprojects(result);
    }
    getProjectsList();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-4 p-4">
        <h1 className="font-bold text-2xl">Projects</h1>
        <p>Manage your quantity take offs</p>
      </div>
      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4">
        {listofProjects.length > 0 ? (
          listofProjects.map((project, key) => (
            <ProjectCard
              key={key}
              name={project.name}
              type={project.type}
              numberOfLineItems={project.takeoffItems.length}
              companyId={project.companyId}
              time={project.updatedAt}
              projectId={project.id}
            />
          ))
        ) : (
          <p>{"No projects"}</p>
        )}
      </div>
    </div>
  );
}
