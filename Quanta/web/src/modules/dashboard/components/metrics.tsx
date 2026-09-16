import { useEffect, useState } from "react";
import { getKPIInformation } from "@/modules/dashboard/api/api";
import type {
  KPIInformationResponse,
  DashboardProject,
} from "@/modules/dashboard/contracts/dashboard.response.contract";
import { GrProjects } from "react-icons/gr";
import { MdMenuBook, MdOutlineTrendingUp } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

// TODO :: replace company id with dynamic reference.

export function Metrics() {
  const [dashboardMetrics, setDashboardMetrics] =
    useState<KPIInformationResponse>();

  useEffect(() => {
    async function getDashboardKPI(): Promise<void> {
      const kpi = await getKPIInformation({ companyId: "seed-company-001" });
      setDashboardMetrics(kpi);
    }

    getDashboardKPI();
  }, []);

  return (
    <div className="flex flex-row gap-4">
      <div className="flex-1 flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <GrProjects size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {dashboardMetrics?.activeProjects ?? "—"}
          </h1>
          <p className="text-sm text-muted-foreground">Active Projects</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <MdMenuBook size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {dashboardMetrics?.totalRecipes ?? "—"}
          </h1>
          <p className="text-sm text-muted-foreground">Total Recipes</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <MdOutlineTrendingUp size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {dashboardMetrics?.completionRate != null
              ? `${dashboardMetrics.completionRate.toFixed(1)}/yr`
              : "—"}
          </h1>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </div>
      </div>

      <div className="flex  flex-1 flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <HiOutlineDocumentText size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {dashboardMetrics?.numberOfUploadedDocuments ?? "—"}
          </h1>
          <p className="text-sm text-muted-foreground">Standards Loaded</p>
        </div>
      </div>
    </div>
  );
}