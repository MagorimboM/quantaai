import { MdOutlineArrowRightAlt } from "react-icons/md";
import { timeAgo } from "@/common/utils/timeAgo";
import type { RecentProject } from "@/modules/dashboard/contracts/dashboard.response.contract";
import { useOpenProjectTakeoff } from "@/modules/dashboard/components/projectCard";

// Warm cream card with an amber-to-rose glow border
const glowBorder: React.CSSProperties = {
  border: "1px solid transparent",
  background:
    "linear-gradient(#FFF7F0,#FFF7F0) padding-box, linear-gradient(110deg, rgba(245,158,11,0.5), rgba(236,72,153,0.35)) border-box",
};

/**
 * "Continue taking off": the project worked on most recently, with one button
 * straight into its bill of quantities. Not shown until there is a project.
 *
 * TODO :: [backend] The design shows the project number and client name
 * beside the title, and adds "Last recipe added: …" to the line under
 * the name. Nothing records that yet, so only the last-edited time is shown.
 */
export function ResumeBanner({ project }: { project: RecentProject }) {
  const openProjectTakeoff = useOpenProjectTakeoff();

  return (
    <section
      style={glowBorder}
      className="flex shrink-0 items-center justify-between gap-6 rounded-2xl border-l-4 px-6 py-5 shadow-[0_10px_32px_rgba(67,50,38,0.055)]"
    >
      <div className="min-w-0">
        <span className="rounded-md bg-[#FFE9DF] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#BD4D32]">
          Continue taking off
        </span>
        <div className="mt-3 flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="truncate text-[22px] font-bold tracking-[-0.02em] text-[#1C1917]">
            {project.name}
          </h2>
          <span className="text-[13px] capitalize text-[#78716C]">
            {project.type.replace(/_/g, " ")}
          </span>
        </div>
        <p className="mt-2 text-[12px] text-[#78716C]">
          Last edited {timeAgo(project.updatedAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => openProjectTakeoff(project.id)}
        className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B4A] px-7 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(255,107,74,0.28)] transition hover:bg-[#F25C3C]"
      >
        Resume Bill of Quantities
        <MdOutlineArrowRightAlt size={20} />
      </button>
    </section>
  );
}