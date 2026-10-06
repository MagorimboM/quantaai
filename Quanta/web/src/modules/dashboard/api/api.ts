import { apiClient } from "@/core/api/axios.api";
import type { GetDashboardRequest } from "@/modules/dashboard/contracts/dashboard.request.contract";
import type {
  KPIInformationResponse,
  RecentActivityResponse,
  RecentProjectsResponse,
} from "@/modules/dashboard/contracts/dashboard.response.contract";

// None of these send a userId: the backend identifies the user from the Clerk
// token that apiClient attaches, and checks the company belongs to them.

// Headline numbers shown in the four cards along the top
export async function getKPIInformation(
  request: GetDashboardRequest,
): Promise<KPIInformationResponse> {
  const response = await apiClient.get(`${request.companyId}/dashboard/kpi`);

  return response.data;
}

// The projects worked on most recently that are not yet completed
export async function getRecentProjects(
  request: GetDashboardRequest,
): Promise<RecentProjectsResponse> {
  const response = await apiClient.get(
    `${request.companyId}/dashboard/recent-projects`,
  );

  return response.data;
}

// The latest changes recorded in the audit log
export async function getRecentActivity(
  request: GetDashboardRequest,
): Promise<RecentActivityResponse> {
  const response = await apiClient.get(
    `${request.companyId}/dashboard/recent-activity`,
  );

  return response.data;
}