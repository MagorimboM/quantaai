import type { ReactNode } from "react";
import {
  MdOutlineArrowRightAlt,
  MdOutlineCategory,
  MdOutlineFlag,
  MdOutlineLayers,
  MdOutlineFolderOpen,
} from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi2";
import {
  humanise,
  statusBadgeClass,
  useOpenProjectTakeoff,
} from "@/modules/projects/components/projectCard";
import { timeAgo } from "@/common/utils/timeAgo";

const kicker = "text-[10px] font-bold uppercase tracking-[0.12em] text-[#A09992]";

function DetailRow({
  icon,
  iconClass,
  label,
  children,
}: {
  icon: ReactNode;
  iconClass: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-[9px] ${iconClass}`}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <small className="text-[11px] font-medium text-[#99918B]">{label}</small>
        <strong className="truncate text-sm font-semibold capitalize text-[#1C1917]">
          {children}
        </strong>
      </div>
    </div>
  );
}

// The right-hand panel of the projects page: the project selected in the list,
// and the way into its takeoff.
//
// TODO :: [backend] The design also shows site address, client, contact and
// email. The project list doesn't return those, so they aren't shown. Add them
// to ProjectSummary (or a get-one-project endpoint) and add a DetailRow each.
export function ProjectDetailCard({
  project,
}: {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    updatedAt: string;
    numberOfLineItems?: number;
  } | null;
}) {
  const openProjectTakeoff = useOpenProjectTakeoff();

  if (!project) {
    return (
      <aside className="flex min-h-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#DDD6CF] bg-white/55 p-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEEAE5] text-[#A69E97]">
          <MdOutlineFolderOpen size={22} />
        </span>
        <p className="mt-1 text-sm font-semibold text-[#1C1917]">
          No project selected
        </p>
        <p className="text-xs text-[#8E8781]">
          Select a project to see its details here.
        </p>
      </aside>
    );
  }

  return (
    <aside className="relative flex min-h-0 flex-col overflow-y-auto rounded-2xl border border-[#EFECE6] bg-white p-6 shadow-[0_12px_35px_rgba(67,50,38,0.065)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-[#FF6B4A] via-[#F97316] to-[#F5B96A]" />

      <div className="flex items-center justify-between gap-2">
        <span className={kicker}>Selected project</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#8D857F]">
          <i className="size-1.5 rounded-full bg-[#22A271] shadow-[0_0_0_3px_#E2F7EE]" />
          Active
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#1C1917]">
        {project.name}
      </h2>
      <p className="mt-1.5 text-xs text-[#908983]">
        Project details and quantity takeoff workspace
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <DetailRow
          icon={<MdOutlineCategory size={18} />}
          iconClass="bg-[#FFE9DF] text-[#D95435]"
          label="Project type"
        >
          {humanise(project.type)}
        </DetailRow>
        <DetailRow
          icon={<MdOutlineFlag size={18} />}
          iconClass="bg-[#FFF0D8] text-[#A86A35]"
          label="Status"
        >
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(project.status)}`}
          >
            {humanise(project.status)}
          </span>
        </DetailRow>
        <DetailRow
          icon={<HiOutlineClock size={18} />}
          iconClass="bg-[#EEE8E4] text-[#74645A]"
          label="Last updated"
        >
          <span className="normal-case">{timeAgo(project.updatedAt)}</span>
        </DetailRow>
        {project.numberOfLineItems !== undefined ? (
          <DetailRow
            icon={<MdOutlineLayers size={18} />}
            iconClass="bg-[#F7E9DF] text-[#936144]"
            label="Line items"
          >
            {project.numberOfLineItems}
          </DetailRow>
        ) : null}
      </div>

      <div className="my-6 h-px bg-[#EEEAE5]" />

      <div className="flex items-start gap-3 rounded-[13px] border border-[#F6DCC9] bg-[#FFF7ED] bg-[radial-gradient(circle_at_100%_0%,rgba(249,115,22,0.07),transparent_44%)] p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-br from-[#FF7B5D] to-[#F36A27] text-white shadow-[0_7px_16px_rgba(249,115,22,0.2)]">
          <MdOutlineLayers size={22} />
        </span>
        <div>
          <span className={kicker}>Workspace</span>
          <h3 className="mt-1 text-sm font-semibold text-[#1C1917]">
            Bill of Quantities (BOQ)
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[#81756C]">
            Launch the takeoff workspace to select recipes, punch in
            quantities, and manage line items.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openProjectTakeoff(project.id)}
        className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF6B4A] text-sm font-semibold text-white shadow-[0_9px_22px_rgba(255,107,74,0.24)] transition-all hover:-translate-y-px hover:bg-[#F25C3C]"
      >
        Open Bill of Quantities
        <MdOutlineArrowRightAlt size={20} />
      </button>
    </aside>
  );
}