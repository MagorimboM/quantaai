import { Metrics } from "@/modules/dashboard/components/metrics";
import { RecentProjects } from "@/modules/dashboard/components/recentProjects";
import { RecentActivity } from "@/modules/dashboard/components/recentActivity";
import { getActiveScope } from "@/common/storage/activeScope";

/**
 * Landing screen of a company workspace: the headline numbers, the projects
 * the user touched last, and what changed recently.
 *
 * Everything on it is about one company, so a personal workspace (no company)
 * shows a message instead.
 * TODO :: [backend] a personal dashboard, then drop the message.
 */
export function DashBoardPage() {
  const { companyId } = getActiveScope();

  if (!companyId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Select a company workspace to see its dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 flex-1 min-h-0 gap-6">
      <Metrics companyId={companyId} />
      <div className="flex flex-1 min-h-0 gap-6">
        <div className="flex flex-1 min-h-0 flex-col">
          <RecentProjects companyId={companyId} />
        </div>
        <div className="flex flex-1 min-h-0 flex-col">
          <RecentActivity companyId={companyId} />
        </div>
      </div>
    </div>
  );
}