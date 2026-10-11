import { apiClient } from "@/core/api/axios.api";

export async function fetchCompanyInformation(companyId: string) {
  const response = await apiClient.get(
    `${companyId}/dashboard/companyInformation`,
  );
  return response.data;
}
