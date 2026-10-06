import { apiClient } from "@/core/api/axios.api";
import type {
  GetSettingsRequest,
  UpdateCompanyProfileRequest,
  AddTeamMemberRequest,
  DeleteTeamMemberRequest,
} from "@/modules/settings/contracts/settings.request.contracts";
import type {
  CompanyProfileDetails,
  TeamMember,
  DeleteTeamMemberResponse,
  StandardDocument,
} from "@/modules/settings/contracts/settings.response.contracts";

// The backend identifies the user from the Clerk token that apiClient attaches
// to every request, and checks the company belongs to them.

export async function getCompanyProfile(
  request: GetSettingsRequest,
): Promise<CompanyProfileDetails> {
  const response = await apiClient.get(`${request.companyId}/settings/profile`);
  return response.data;
}

// Saves the edited company details and returns the company as stored
export async function updateCompanyProfile(
  request: UpdateCompanyProfileRequest,
): Promise<CompanyProfileDetails> {
  const { companyId, ...fields } = request;
  const response = await apiClient.put(`${companyId}/settings/profile`, fields);
  return response.data;
}

export async function getCompanyTeamMembers(
  request: GetSettingsRequest,
): Promise<TeamMember[]> {
  const response = await apiClient.get(`${request.companyId}/settings/team`);
  return response.data;
}

export async function addTeamMember(
  request: AddTeamMemberRequest,
): Promise<TeamMember> {
  const { companyId, ...member } = request;
  const response = await apiClient.post(`${companyId}/settings/team`, member);
  return response.data;
}

export async function deleteTeamMember(
  request: DeleteTeamMemberRequest,
): Promise<DeleteTeamMemberResponse> {
  const response = await apiClient.delete(
    `${request.companyId}/settings/team/${request.memberId}`,
  );
  return response.data;
}

// The company's standards and compliance documents
export async function getStandardsDocuments(
  request: GetSettingsRequest,
): Promise<StandardDocument[]> {
  const response = await apiClient.get(
    `${request.companyId}/settings/documents`,
  );
  return response.data;
}