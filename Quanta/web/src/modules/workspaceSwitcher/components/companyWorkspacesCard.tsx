import { useNavigate } from "react-router";
import { ChevronRight } from "@/modules/workspaceSwitcher/components/workspaceSwitcherIcons";
import { getInitials, getColorForName } from "@/modules/workspaceSwitcher/components/workspaceSwitcher.utils";

// TODO :: [backend] badge (e.g. "5 due this week") needs per-company due-date
// aggregation that doesn't exist yet -- left out until that data is real.

export function CompanyWorkSpaceCard({
  id,
  companyId,
  companyName,
  numberOfProjects,
  numberOfRecipes,
  lastActivity,
}: {
  id: string;
  companyId: string;
  companyName: string;
  numberOfProjects: number;
  numberOfRecipes: number;
  lastActivity: string;
}) {
  const navigate = useNavigate();

  function goToWorkSpace() {
    localStorage.setItem("workspaceId", id);
    localStorage.setItem("companyId", companyId);
    navigate("/dashboard");
  }

  const initials = getInitials(companyName);
  const color = getColorForName(companyName);

  return (
    <button
      onClick={goToWorkSpace}
      className="w-full text-left bg-white border border-[#F3DEC0] rounded-md p-4 transition-all duration-150 hover:border-[#E8C99A] hover:shadow-[0_2px_12px_rgba(43,27,14,0.07)] group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold text-white select-none"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <span className="text-[#2B1B0E] font-semibold text-sm leading-snug truncate">
              {companyName}
            </span>
            <span className="flex-shrink-0 mt-0.5 transition-transform duration-150 group-hover:translate-x-0.5">
              <ChevronRight />
            </span>
          </div>

          <p className="text-[11px] text-[#B89B6E] mb-2.5">Active {lastActivity}</p>

          <div className="flex items-center gap-4 text-xs text-[#9C7B4F]">
            <span>
              <span className="text-[#2B1B0E] font-medium">{numberOfProjects}</span> proj
            </span>
            <span>
              <span className="text-[#2B1B0E] font-medium">{numberOfRecipes}</span> recipes
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}