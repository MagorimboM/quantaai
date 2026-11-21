import { useEffect, useState } from "react";
import { HiOutlineClock } from "react-icons/hi2";
import { getRecentActivity } from "@/modules/dashboard/api/api";
import type { RecentActivityResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";
import { timeAgo } from "@/common/utils/timeAgo";

// TODO :: [backend] Nothing writes to the audit_logs table yet, so this panel
// is always empty. Each change to a takeoff, recipe or document needs to add a
// row. Settle on how `action` and `entityType` are worded when that is built,
// because they are shown here as written.
//
// TODO :: [backend] The design has a "Line items punched in (last 14 days)"
// chart and a "Most used recipes" list in this area. Neither has an endpoint
// yet, so this panel (the real audit trail) takes their place.

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
    <section className="flex h-full min-h-0 flex-col gap-4 rounded-2xl border border-[#EFECE6] bg-white p-5 shadow-[0_10px_32px_rgba(67,50,38,0.055)]">
      <div className="shrink-0">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#1C1917]">
          Recent Activity
        </h2>
        <p className="mt-0.5 text-[12px] text-[#A8A29E]">
          What your team changed lately.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {activity.length > 0 ? (
          <div className="divide-y divide-[#F0EDE8]">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <p className="min-w-0 text-[13px] text-[#1C1917]">
                  <span className="font-semibold">{item.userName}</span>{" "}
                  <span className="text-[#78716C]">{item.action}</span>{" "}
                  <span className="rounded-md bg-[#FFF1E7] px-1.5 py-0.5 text-[11px] font-semibold text-[#E95333]">
                    {item.entityType}
                  </span>
                </p>
                <span className="shrink-0 whitespace-nowrap text-[11px] text-[#A8A29E]">
                  {timeAgo(item.changedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-[#A8A29E]">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#F5F3EF]">
              <HiOutlineClock size={22} />
            </span>
            <p className="text-sm text-[#78716C]">No recent activity</p>
          </div>
        )}
      </div>
    </section>
  );
}