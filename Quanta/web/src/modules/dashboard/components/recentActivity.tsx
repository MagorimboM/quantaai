import { useEffect, useState } from "react";
import { HiOutlineClock } from "react-icons/hi2";
import { getRecentActivity } from "@/modules/dashboard/api/api";
import type { RecentActivityResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";

// TODO :: replace company id with dynamic reference.
// TODO :: make sure it scrollable


function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivity() {
  const [activity, setActivity] = useState<RecentActivityResponse>([]);

  useEffect(() => {
    async function loadActivity() {
      const response = await getRecentActivity({ companyId: "seed-company-001" });
      setActivity(response);
    }

    loadActivity();
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-row items-center gap-2">
        <HiOutlineClock size={20} className="text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Recent Activity</h1>
      </div>

      <div className="flex flex-col gap-2">
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