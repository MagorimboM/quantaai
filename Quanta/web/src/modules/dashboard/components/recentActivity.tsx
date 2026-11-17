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
    <div className="flex h-full min-h-0 flex-col gap-4 rounded-2xl border border-[#F0EDE8] bg-white p-5 text-[#1C1917]">
      <div className="flex flex-row items-center gap-3 shrink-0">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#FFF4EE] text-[#FF6B35]">
          <HiOutlineClock size={18} />
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-[#1C1917]">
          Recent Activity
        </h1>
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto">
        {activity.length > 0 ? (
          activity.map((item) => (
            <div
              key={item.id}
              className="flex flex-row items-center justify-between rounded-xl border border-[#F0EDE8] bg-white px-3 py-2.5"
            >
              <p className="text-sm text-[#1C1917]">
                <span className="font-medium">{item.userName}</span>{" "}
                <span className="text-[#78716C]">{item.action}</span>{" "}
                <span className="font-medium text-[#FF6B35]">{item.entityType}</span>
              </p>
              <span className="text-xs text-[#A8A29E] whitespace-nowrap">
                {timeAgo(item.changedAt)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-[#A8A29E]">
            <HiOutlineClock size={32} />
            <p className="text-sm text-[#78716C]">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}