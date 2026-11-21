import { useEffect, useState } from "react";
import { getKPIInformation } from "@/modules/dashboard/api/api";
import type { KPIInformationResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";
import { GrProjects } from "react-icons/gr";
import { MdMenuBook, MdOutlineTrendingUp } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

// One headline number: label and tinted icon on top, the figure, then a small
// note underneath (plain grey).
function MetricCard({
  icon,
  iconClass,
  value,
  unit,
  label,
  note,
}: {
  icon: React.ReactNode;
  iconClass: string; // background and colour of the icon tile
  value: string | number;
  unit?: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#EFECE6] bg-white p-5 shadow-[0_10px_32px_rgba(67,50,38,0.055)] transition-all hover:-translate-y-0.5 hover:border-[#FFC2B1]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-[#78716C]">{label}</p>
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[34px] font-bold leading-none tracking-[-0.03em] text-[#1C1917]">
        {value}
        {unit ? (
          <span className="ml-1 text-[15px] font-semibold tracking-normal text-[#A8A29E]">
            {unit}
          </span>
        ) : null}
      </p>
      {note ? (
        <span className="mt-3 w-fit text-[11px] font-medium text-[#A8A29E]">
          {note}
        </span>
      ) : (
        <span className="mt-3 h-6" />
      )}
    </div>
  );
}

/**
 * The four headline numbers for the company. A "—" shows until they load.
 *
 *  - Active projects: projects not yet marked complete (drafts included),. TODO :: [backend] add
 *    "+N this month" (the design has it) once the KPI endpoint returns it.
 *  - Total recipes: recipes in the library. Archived recipes are not counted.
 *  - Completion rate: completed projects per year, counted from the year of the
 *    company's first project. A company in its first year counts as one year.
 *  - Documents uploaded: the specs, drawings and policies uploaded for the
 *    company. These are what the AI assistant reads.
 *
 * TODO :: [backend] The design also has "Line items measured" and "Unstarted
 * BOQs". The KPI endpoint doesn't return either, so they aren't shown.
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
    <div className="grid shrink-0 grid-cols-4 gap-4">
      <MetricCard
        icon={<GrProjects size={16} />}
        iconClass="bg-[#FFE9DF] text-[#E95333]"
        value={dashboardMetrics?.activeProjects ?? "—"}
        label="Active Projects"
        note="Not yet completed"
      />
      <MetricCard
        icon={<MdMenuBook size={18} />}
        iconClass="bg-[#FEF3C7] text-[#B45309]"
        value={dashboardMetrics?.totalRecipes ?? "—"}
        label="Total Recipes"
        note="In your library"
      />
      <MetricCard
        icon={<MdOutlineTrendingUp size={18} />}
        iconClass="bg-[#ECFDF5] text-[#059669]"
        value={
          dashboardMetrics ? dashboardMetrics.completionRate.toFixed(1) : "—"
        }
        unit={dashboardMetrics ? "/yr" : undefined}
        label="Completion Rate"
        note="Projects completed per year"
      />
      <MetricCard
        icon={<HiOutlineDocumentText size={18} />}
        iconClass="bg-[#FFF1F2] text-[#E11D48]"
        value={dashboardMetrics?.numberOfUploadedDocuments ?? "—"}
        label="Documents Uploaded"
        note="Read by the AI assistant"
      />
    </div>
  );
}