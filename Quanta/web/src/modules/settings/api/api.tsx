import { apiClient } from "@/core/api/axios.api";

type UpdateCompanyRequest = {
  companyName: string;
  companyAddress: string;
};

export async function GetCompanyInfo() {
  const response = await apiClient.get("/");
  return response.data;
}

export async function GetCompanyTeamMembers() {
  const response = await apiClient.get("/");
  return response.data;
}

export async function GetCompanyComplianceStandards() {
  const response = await apiClient.get("/");
  return response.data;
}; 



