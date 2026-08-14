import { apiClient } from "@/core/api/axios.api";

// ---settings page -------:

// on Cancel button
export async function RestoreFieldsFiles(
  companyStateUpdater: (companyInfo: any | null) => void,
  teamMemberStateUpdater: (teamMemberInfo: any | null) => void,
  stnAndCompStateUpdater: (stnAndCompState: any | null) => void,
) {
  // get the data from the network
  const companyInformationResponse = await apiClient.get("/");
  const teamMembersResponse = await apiClient.get("/");
  const standardAndComplianceResponse = await apiClient.get("/");
  // update the states
  companyStateUpdater(companyInformationResponse.data);
  teamMemberStateUpdater(teamMembersResponse.data);
  stnAndCompStateUpdater(standardAndComplianceResponse.data);
}
// on save changes button
export async function updateFieldFiles({
  companyInformationUpdate,
  teamMemberUpdates,
  standardAndComplianceUpdates,
  companyInformationStateUpdater,
  teamMemberStateUpdater,
  standardAndComplianceUpdater,
}: {
  companyInformationUpdate?: any | null;
  companyInformationStateUpdater: (componyInformation: any) => void;
  teamMemberUpdates?: any | null;
  teamMemberStateUpdater: (teamMemberUpdates: any) => void;
  standardAndComplianceUpdates?: any | null;
  standardAndComplianceUpdater: (standardAndComplianceUpdater: any) => void;
}) {
  // get the updates from the states...
  // send them over the nework
  // update the states. 

  if (companyInformationUpdate != null) {
    // send the updates via the network -> get the response  -> update the settings page.
    const response = await apiClient.put("/", companyInformationUpdate);
    companyInformationStateUpdater(response.data);    
  }

  if (teamMemberUpdates != null) {
    // send the updates via the network -> get the response  -> update the settings page.
    const response = await apiClient.put("/", teamMemberUpdates);
    teamMemberStateUpdater(response.data);
  }

  if (standardAndComplianceUpdates != null) {
    // send the updates via the network -> get the response  -> update the settings page.
    const response = await apiClient.put("/", standardAndComplianceUpdates);
    standardAndComplianceUpdater(response.data);
  }
}; 

