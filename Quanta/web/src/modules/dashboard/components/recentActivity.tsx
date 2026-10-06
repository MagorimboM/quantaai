import { useEffect, useState } from "react";
import { HiOutlineClock } from "react-icons/hi2";
import { getRecentActivity } from "@/modules/dashboard/api/api";
import type { RecentActivityResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";
import { timeAgo } from "@/common/utils/timeAgo";

// TODO :: [backend] Nothing writes to the audit_logs table yet, so this panel
// is always empty. Each change to a takeoff, recipe or document needs to add a
// row. Settle on how `action` and `entityType` are worded when that is built,
// because they are shown here as written.

// The latest recorded changes for the company, newest first: who did what to
// which kind of record, and how long ago. This is the company's audit trail.
export function RecentActivity({ companyId }: { companyId: string }) {
  const [activity, setActivity] = useState<RecentActivityResponse>([]);

  useEffect(() => {
    async function loadActivity() {
      try {
        const response = await getRecentActivity({ companyId });
        setActivity(response);
      } catch {
        // apiClient already reports the failure; the list stays empty
      }
    }

    loadActivity();
  }, [companyId]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-row items-center gap-2 shrink-0">
        <HiOutlineClock size={20} className="text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Recent Activity</h1>
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto">
        {activity.length > 0 ? (
          activity.map((item) => (
            <div
              key={item.id}
              className="flex flex-row items-center justify-between rounded-md border bg-muted/40 px-3 py-2"
            >
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.userName}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>{" "}
                <span className="font-medium">{item.entityType}</span>
              </p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo(item.changedAt)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <HiOutlineClock size={32} />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}