import { useEffect, useState } from "react";
import { getKPIInformation } from "@/modules/dashboard/api/api";
import type {
  KPIInformationResponse,
  DashboardProject,
} from "@/modules/dashboard/contracts/dashboard.response.contract";

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
    <div className="flex flex-1 flex-row justify-between gap-4">
      <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-card p-4 text-card-foreground">
        <h1 className="text-2xl font-bold text-foreground">
          {dashboardMetrics?.activeProjects}
        </h1>
        <p className="text-sm text-muted-foreground">Active Projects</p>
      </div>
      <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-card p-4 text-card-foreground">
        <h1 className="text-2xl font-bold text-foreground">
          {dashboardMetrics?.totalRecipes}
        </h1>
        <p className="text-sm text-muted-foreground">Total Recipes</p>
      </div>
      <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-card p-4 text-card-foreground">
        <h1 className="text-2xl font-bold text-foreground">
          {dashboardMetrics?.completionRate}
        </h1>
        <p className="text-sm text-muted-foreground">Completion Rate</p>
      </div>
      <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-card p-4 text-card-foreground">
        <h1 className="text-2xl font-bold text-foreground">
          {dashboardMetrics?.numberOfUploadedDocuments}
        </h1>
        <p className="text-sm text-muted-foreground">Standard Loaded</p>
      </div>
    </div>
  );
}