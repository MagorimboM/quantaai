import { useEffect, useState } from "react";
import { getKPIInformation } from "@/modules/dashboard/api/api";
import type { KPIInformationResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";
import { GrProjects } from "react-icons/gr";
import { MdMenuBook, MdOutlineTrendingUp } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

// One headline number with its icon and label
function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#F0EDE8] bg-white p-5 text-[#1C1917] transition-colors hover:border-[#FFD9C9]">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF4EE] text-[#FF6B35]">
        {icon}
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1C1917]">
          {value}
        </h1>
        <p className="mt-0.5 text-sm text-[#78716C]">{label}</p>
      </div>
    </div>
  );
}

/**
 * The four headline numbers for the company. A "—" shows until they load.
 *
 *  - Active projects: projects not yet marked complete (drafts included).
 *  - Total recipes: recipes in the library. Archived recipes are not counted.
 *  - Completion rate: completed projects per year, counted from the year of the
 *    company's first project. A company in its first year counts as one year.
 *  - Documents uploaded: the specs, drawings and policies uploaded for the
 *    company. These are what the AI assistant reads.
 */
export function Metrics({ companyId }: { companyId: string }) {
  const [dashboardMetrics, setDashboardMetrics] =
    useState<KPIInformationResponse>();

  useEffect(() => {
    async function loadKPI() {
      try {
        const kpi = await getKPIInformation({ companyId });
        setDashboardMetrics(kpi);
      } catch {
        // apiClient already reports the failure; the cards keep showing "—"
      }
    }

    loadKPI();
  }, [companyId]);

  return (
    <div className="flex flex-row gap-4">
      <MetricCard
        icon={<GrProjects size={18} />}
        value={dashboardMetrics?.activeProjects ?? "—"}
        label="Active Projects"
      />
      <MetricCard
        icon={<MdMenuBook size={18} />}
        value={dashboardMetrics?.totalRecipes ?? "—"}
        label="Total Recipes"
      />
      <MetricCard
        icon={<MdOutlineTrendingUp size={18} />}
        value={
          dashboardMetrics
            ? `${dashboardMetrics.completionRate.toFixed(1)}/yr`
            : "—"
        }
        label="Completion Rate"
      />
      <MetricCard
        icon={<HiOutlineDocumentText size={18} />}
        value={dashboardMetrics?.numberOfUploadedDocuments ?? "—"}
        label="Documents Uploaded"
      />
    </div>
  );
}