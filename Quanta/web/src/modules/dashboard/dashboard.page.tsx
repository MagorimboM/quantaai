import { useNavigate } from "react-router";
import { MdOutlineArrowRightAlt } from "react-icons/md";
import { Metrics } from "@/modules/dashboard/components/metrics";
import { ResumeBanner } from "@/modules/dashboard/components/resumeBanner";
import {
  RecentProjects,
  useRecentProjects,
} from "@/modules/dashboard/components/recentProjects";
import { RecentActivity } from "@/modules/dashboard/components/recentActivity";
import { getActiveScope } from "@/common/storage/activeScope";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Landing screen of a company workspace: the headline numbers, the project to
 * continue, what changed recently, and the projects the user touched last.
 *
 * Everything on it is about one company, so a personal workspace (no company)
 * shows a message instead. The page fills whatever space the shell gives it.
 * TODO :: [backend] a personal dashboard, then drop the message.
 * TODO :: [feature] greet the user by first name (the design says "Alex").
 */
export function DashBoardPage() {
  const { companyId } = getActiveScope();

  if (!companyId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#FAF8F5] p-4">
        <p className="text-sm text-[#78716C]">
          Select a company workspace to see its dashboard.
        </p>
      </div>
    );
  }

  return <CompanyDashboard companyId={companyId} />;
}

// Split out so the projects hook only runs when there is a company
function CompanyDashboard({ companyId }: { companyId: string }) {
  const navigate = useNavigate();
  const { projects, isLoading } = useRecentProjects(companyId);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-[#FAF8F5] p-6 text-[#1C1917]">
      <header className="flex shrink-0 items-end justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-bold leading-none tracking-[-0.03em]">
            Dashboard
          </h1>
          <p className="mt-2 text-[13px] text-[#78716C]">
            {greeting()}. Let&apos;s build on your progress.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(255,107,74,0.28)] transition hover:bg-[#F25C3C]"
        >
          Open Projects
          <MdOutlineArrowRightAlt size={20} />
        </button>
      </header>

      <Metrics companyId={companyId} />

      {projects.length > 0 ? <ResumeBanner project={projects[0]} /> : null}

      <div className="grid min-h-[360px] flex-1 grid-cols-[minmax(0,58fr)_minmax(0,42fr)] gap-5">
        <RecentActivity companyId={companyId} />
        <RecentProjects projects={projects} isLoading={isLoading} />
      </div>
    </div>
  );
}