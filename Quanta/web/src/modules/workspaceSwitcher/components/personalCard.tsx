import { useNavigate } from "react-router";
import { ChevronRight } from "@/modules/workspaceSwitcher/components/workspaceSwitcherIcons";

// Opens the personal workspace. A personal workspace belongs to no company, so
// only workspaceId is saved and any saved company is cleared. Same pattern as
// CompanyWorkSpaceCard.

export function PersonalWorkSpaceCard({
  id,
  numberOfProjects,
  numberOfRecipes,
  lastActivity,
}: {
  id: string;
  numberOfProjects: number;
  numberOfRecipes: number;
  lastActivity: string;
}) {
  const navigate = useNavigate();

  function goToWorkSpace() {
    localStorage.setItem("workspaceId", id);
    localStorage.removeItem("companyId");
    navigate("/dashboard");
  }

  return (
    <button
      onClick={goToWorkSpace}
      className="group flex min-h-[215px] w-full cursor-pointer flex-col rounded-xl border border-[#F0EDE8] bg-white p-6 text-left transition-colors duration-150 hover:border-[#FFD9C9] hover:bg-[#FFF4EE] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FFF4EE]"
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="flex h-10 w-10 select-none items-center justify-center rounded-full border border-[#F0EDE8] bg-[#FAFAF9] text-sm font-semibold text-[#57534E]">
          ✦
        </div>
        <span className="mt-1 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
          <ChevronRight />
        </span>
      </div>

      <p className="mb-1.5 text-base font-semibold leading-5 tracking-[-0.015em] text-[#1C1917]">
        My Workspace
      </p>
      <p className="text-[13px] text-[#78716C]">Active {lastActivity}</p>

      <div className="mt-auto grid grid-cols-2 gap-4 pt-7">
        <div>
          <p className="mb-1 text-2xl font-semibold leading-none tracking-tight text-[#1C1917]">
            {numberOfProjects}
          </p>
          <p className="text-xs text-[#78716C]">Projects</p>
        </div>
        <div>
          <p className="mb-1 text-2xl font-semibold leading-none tracking-tight text-[#1C1917]">
            {numberOfRecipes}
          </p>
          <p className="text-xs text-[#78716C]">Recipes</p>
        </div>
      </div>
    </button>
  );
}