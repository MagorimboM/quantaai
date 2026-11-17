import { useNavigate } from "react-router";
import { ChevronRight } from "@/modules/workspaceSwitcher/components/workspaceSwitcherIcons";
import { getInitials } from "@/modules/workspaceSwitcher/components/workspaceSwitcher.utils";

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

  return (
    <button
      onClick={goToWorkSpace}
      className="group w-full cursor-pointer rounded-xl border border-[#F0EDE8] bg-white p-4 text-left transition-colors duration-150 hover:border-[#FFD9C9] hover:bg-[#FFF4EE] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FFF4EE]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 select-none items-center justify-center rounded-[9px] bg-[#F5F5F4] text-xs font-semibold text-[#57534E] transition-colors duration-150 group-hover:bg-white group-hover:text-[#E85A26]">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1.5 truncate text-sm font-medium leading-[18px] text-[#1C1917]">
            {companyName}
          </p>
          <p className="truncate text-xs leading-4 text-[#78716C]">
            {numberOfProjects} projects · {numberOfRecipes} recipes · Active{" "}
            {lastActivity}
          </p>
        </div>

        <span className="flex-shrink-0 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
          <ChevronRight />
        </span>
      </div>
    </button>
  );
}