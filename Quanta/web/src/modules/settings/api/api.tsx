import { apiClient } from "@/core/api/axios.api";

export async function getCompanyInfo(companyId: string) {
  const response = await apiClient.get(`${companyId}/settings/companyProfile`);
  return response.data;
}

export async function getCompanyTeamMembers(companyId: string) {
  const response = await apiClient.get(`${companyId}/settings/companyTeam`);
  return response.data;
}

export async function getCompanyComplianceStandards(companyId: string) {
  const response = await apiClient.get(
    `${companyId}/settings/compliance-and-standard-documents`,
  );
  return response.data;
}
