import { MdOutlineArrowRightAlt } from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi2";
import { useNavigate } from "react-router";
import { setActiveProject } from "@/common/storage/activeScope";
import { timeAgo } from "@/common/utils/timeAgo";

// Stored values look like "in_progress" or "single_storey"; shown with spaces,
// and the `capitalize` class gives them a capital letter.
export function humanise(value: string): string {
  return value.replace(/_/g, " ");
}

// Completed projects get the mint badge, everything else the peach one
export function statusBadgeClass(status: string): string {
  return status === "completed"
    ? "border-[#D5F2E3] bg-[#ECFDF5] text-[#059669]"
    : "border-[#FFD5C7] bg-[#FFE9DF] text-[#BD4D32]";
}

// Records the project as the active one and opens its takeoff. The company is
// already the active one (both lists are scoped to it).
export function useOpenProjectTakeoff() {
  const navigate = useNavigate();

  return function openProjectTakeoff(projectId: string) {
    setActiveProject(projectId);
    navigate("/projects/bill-of-quants");
  };
}

type ProjectCardProject = {
  id: string;
  name: string;
  type: string;
  status: string;
  updatedAt: string;
  numberOfLineItems?: number;
};

// One project, as shown on the dashboard and on the projects list.
//
// On the dashboard (no `onSelect`) clicking the card opens the takeoff. On the
// projects list `onSelect` is given: clicking the card only SELECTS it (the
// detail panel shows it) and the "Open takeoff" pill opens it. `numberOfLineItems`
// is optional because the dashboard doesn't load it.
export function ProjectCard({
  project,
  selected = false,
  onSelect,
}: {
  project: ProjectCardProject;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const openProjectTakeoff = useOpenProjectTakeoff();

  function activate() {
    if (onSelect) onSelect();
    else openProjectTakeoff(project.id);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      className={`group flex w-full cursor-pointer flex-row justify-between gap-4 rounded-2xl border p-4 text-left outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-[#FF6B4A]/15 ${
        selected
          ? "border-[#FF6B4A] bg-[#FFF7ED] shadow-[0_13px_32px_rgba(169,83,48,0.11)]"
          : "border-[#EFECE6] bg-white shadow-[0_7px_24px_rgba(67,50,38,0.045)] hover:-translate-y-0.5 hover:border-[#FFC2B1] hover:shadow-[0_12px_30px_rgba(112,66,43,0.09)]"
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate text-base font-semibold tracking-tight text-[#1C1917]">
          {project.name}
        </h2>
        <p className="text-sm text-[#78716C] capitalize">
          {humanise(project.type)}
        </p>
        <div className="mt-2 flex flex-row items-center gap-4">
          <p className="flex flex-row items-center gap-1.5 text-xs text-[#A8A29E]">
            <HiOutlineClock size={14} /> Updated {timeAgo(project.updatedAt)}
          </p>
          {project.numberOfLineItems !== undefined ? (
            <p className="text-xs text-[#A8A29E]">
              {project.numberOfLineItems} item
              {project.numberOfLineItems === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(project.status)}`}
        >
          {humanise(project.status)}
        </span>

        {onSelect ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openProjectTakeoff(project.id);
            }}
            className={`flex h-8 cursor-pointer items-center gap-1 rounded-full border bg-white px-3 text-xs font-semibold transition-colors hover:border-[#FFC6B5] hover:text-[#E25738] ${
              selected
                ? "border-[#FFC6B5] text-[#E25738]"
                : "border-[#E9E4DE] text-[#7B746F]"
            }`}
          >
            Open takeoff
            <MdOutlineArrowRightAlt size={18} />
          </button>
        ) : (
          <MdOutlineArrowRightAlt
            className="text-[#A8A29E] transition-colors group-hover:text-[#FF6B4A]"
            size={20}
          />
        )}
      </div>
    </article>
  );
}