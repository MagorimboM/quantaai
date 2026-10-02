import { useNavigate } from "react-router";
import { ChevronRight } from "@/modules/workspaceSwitcher/components/workspaceSwitcherIcons";

// NOTE :: [behavior change] the original PersonalWorkSpaceCard had no click
// handler at all -- it rendered as if clickable (cursor-pointer) but did
// nothing. This now actually navigates, matching CompanyWorkSpaceCard's
// pattern. Personal workspaces don't have a separate companyId, so only
// workspaceId is set.

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
      className="w-full text-left bg-white border border-[#F3DEC0] rounded-md p-6 transition-all duration-150 hover:border-[#E8C99A] hover:shadow-[0_3px_18px_rgba(43,27,14,0.08)] group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-full bg-[#F3DEC0] flex items-center justify-center text-[#9C7B4F] text-xl font-bold select-none">
          ✦
        </div>
        <span className="mt-1 transition-transform duration-150 group-hover:translate-x-0.5">
          <ChevronRight color="#9C7B4F" />
        </span>
      </div>

      <p className="text-[#2B1B0E] font-semibold text-base mb-1">My Workspace</p>
      <p className="text-[11px] text-[#B89B6E] mb-7">Active {lastActivity}</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-[#2B1B0E] leading-none mb-1.5 tracking-tight">
            {numberOfProjects}
          </p>
          <p className="text-[10px] text-[#9C7B4F] uppercase tracking-widest">Projects</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#2B1B0E] leading-none mb-1.5 tracking-tight">
            {numberOfRecipes}
          </p>
          <p className="text-[10px] text-[#9C7B4F] uppercase tracking-widest">Recipes</p>
        </div>
      </div>
    </button>
  );
}