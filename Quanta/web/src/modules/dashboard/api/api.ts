import { apiClient } from "@/core/api/axios.api";
import type {
  KPIInformationResponse,
  DashboardProject,
  RecentActivityResponse,
} from "@/modules/dashboard/contracts/dashboard.response.contract";
import type {
  GetRecentActivityRequest,
  GetRecentProjectsRequest,
  GetKPIInformationRequest,
} from "@/modules/dashboard/contracts/dashboard.request.contract";

import type { RecentProjectsResponse } from "@/modules/dashboard/contracts/dashboard.response.contract";

export async function getRecentActivity(
  request: GetRecentActivityRequest,
): Promise<RecentActivityResponse> {
  const response = await apiClient.get(
    `${request.companyId}/dashboard/recent-activity`,
  );

  return response.data;
}

export async function getRecentProjects(
  request: GetRecentProjectsRequest,
): Promise<RecentProjectsResponse> {
  const response = await apiClient.get(
    `${request.companyId}/dashboard/recent-projects`,
  );

  return response.data;
}

export async function getKPIInformation(
  request: GetKPIInformationRequest,
): Promise<KPIInformationResponse> {
  const response = await apiClient.get(
    `${request.companyId}/dashboard/kpi`,
  );

  return response.data;
}