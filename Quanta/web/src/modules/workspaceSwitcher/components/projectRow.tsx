import { useNavigate } from "react-router";
import { formatDueDate, urgencyTextClass, getColorForName } from "@/modules/workspaceSwitcher/components/workspaceSwitcher.utils";
import type { ProjectSummary } from "@/modules/workspaceSwitcher/contracts/workspaceSwitcher.types"

export function ProjectRow({ project }: { project: ProjectSummary }) {
  const navigate = useNavigate();
  const dateInfo = project.dueDate ? formatDueDate(project.dueDate) : null;
  const color = getColorForName(project.companyName);

  function handleClick() {
    localStorage.setItem("companyId", project.companyId);
    localStorage.setItem("projectId", project.id);
    navigate("/projects/bill-of-quants");
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-center gap-3 py-3 border-b border-[#F3DEC0] rounded-sm hover:bg-[#FFF4EA] transition-colors duration-100 cursor-pointer -mx-2 px-2"
    >
      <div
        className="w-[3px] h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#2B1B0E] font-medium leading-snug truncate">
          {project.name}
        </p>
        <p className="text-[11px] text-[#B89B6E] mt-0.5 truncate">{project.companyName}</p>
      </div>

      <div className="flex-shrink-0 text-right min-w-[4rem]">
        {dateInfo ? (
          <span className={`text-[11px] ${urgencyTextClass[dateInfo.urgency]}`}>
            {dateInfo.label}
          </span>
        ) : (
          <span className="text-[11px] text-[#B89B6E]">{project.updatedAt}</span>
        )}
      </div>
    </button>
  );
}