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
      className="flex min-h-16 w-full cursor-pointer items-center gap-3 border-b border-[#F0EDE8] px-1 py-3 text-left transition-all duration-150 hover:bg-[#FFF4EE] hover:px-2 focus-visible:bg-[#FFF4EE] focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <p className="mb-1 truncate text-sm font-medium leading-[18px] text-[#1C1917]">
          {project.name}
        </p>
        <p className="flex items-center gap-[7px] text-xs leading-4 text-[#78716C]">
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="truncate">{project.companyName}</span>
        </p>
      </div>

      <div className="min-w-16 flex-shrink-0 text-right">
        {dateInfo ? (
          <span
            className={`text-xs tabular-nums ${urgencyTextClass[dateInfo.urgency]}`}
          >
            {dateInfo.label}
          </span>
        ) : (
          <span className="text-xs tabular-nums text-[#78716C]">
            {project.updatedAt}
          </span>
        )}
      </div>
    </button>
  );
}