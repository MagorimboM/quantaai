import { MdChevronRight } from "react-icons/md";
import { useNavigate } from "react-router";
import type { RecentProject } from "@/modules/dashboard/contracts/dashboard.response.contract";
import { setActiveProject } from "@/common/storage/activeScope";
import { timeAgo } from "@/common/utils/timeAgo";

// Stored values look like "in_progress" or "single_storey"; shown with spaces,
// and the `capitalize` class gives them a capital letter.
function humanise(value: string): string {
  return value.replace(/_/g, " ");
}

// Completed is mint, in progress is amber, anything else (drafts) is rose
function statusClass(status: string): string {
  if (status === "completed") return "bg-[#ECFDF5] text-[#059669]";
  if (status === "in_progress") return "bg-[#FEF3C7] text-[#B45309]";
  return "bg-[#FFF1F2] text-[#BE123C]";
}

// Records the project as active and opens its takeoff. The company is already
// the active one (everything on the dashboard belongs to it).
export function useOpenProjectTakeoff() {
  const navigate = useNavigate();

  return function openProjectTakeoff(projectId: string) {
    setActiveProject(projectId);
    navigate("/projects/bill-of-quants");
  };
}

// One project on the dashboard. Clicking it opens that project's takeoff.
//
// TODO :: [backend] The design also shows a project number ("PRJ-204"), the
// client name and a "128 line items" pill. The recent projects contract
// doesn't have them, so the type is shown in the chip and the rest is left out.
export function ProjectCard({ project }: { project: RecentProject }) {
  const openProjectTakeoff = useOpenProjectTakeoff();

  return (
    <button
      onClick={() => openProjectTakeoff(project.id)}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#EFECE6] bg-white p-3.5 text-left transition-all hover:border-[#FFC2B1] hover:bg-[#FFF7ED]"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span className="shrink-0 rounded-md bg-[#F5F3EF] px-2 py-1 text-[10px] font-bold capitalize text-[#78716C]">
            {humanise(project.type)}
          </span>
          <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#1C1917]">
            {project.name}
          </h3>
          <span
            className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold capitalize ${statusClass(project.status)}`}
          >
            {humanise(project.status)}
          </span>
        </div>
        <p className="text-[11px] text-[#A8A29E]">
          Updated {timeAgo(project.updatedAt)}
        </p>
      </div>
      <MdChevronRight
        size={20}
        className="shrink-0 text-[#A8A29E] transition-colors group-hover:text-[#FF6B4A]"
      />
    </button>
  );
}