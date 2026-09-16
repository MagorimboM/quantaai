import { Metrics } from "@/modules/dashboard/components/metrics";
import { RecentProjects } from "@/modules/dashboard/components/recentProjects";
import { RecentActivity } from "@/modules/dashboard/components/recentActivity";

export function DashBoardPage() {
  return (
    <div className="flex flex-col p-4 flex-1 min-h-0 gap-6">
      <Metrics />
      <div className="flex flex-1 min-h-0 gap-6">
        <div className="flex flex-1 min-h-0 flex-col">
          <RecentProjects />
        </div>
        <div className="flex flex-1 min-h-0 flex-col">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}