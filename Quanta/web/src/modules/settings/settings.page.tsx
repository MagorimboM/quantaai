import { useState, useEffect } from "react";
import { CompanyProfile } from "@/modules/settings/components/companyProfile ";
import { CompanyTeamMembers } from "@/modules/settings/components/companyTeamMembersList";
import { CompanyStandardsComplaintsDocs } from "@/modules/settings/components/companyStandardsCompliantsDocs";
import {
  updateFieldFiles,
  RestoreFieldsFiles,
} from "@/modules/settings/services/services";

type Address = {
  state: string;
  city: string;
  postCode: string;
  street: string;
  houseNumber: number | null;
};

type CompanyInformation = {
  companyId: string;
  companyName: string;
  companyAddress: Address;
};

type TeamMember = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};

type Documents = {
  documentId: string;
  documentName: string;
  documentType: string;
};

export function SettingsPage() {
  const [companyProfile, setCompanyInformation] =
    useState<CompanyInformation | null>({
      companyId: "",
      companyName: "Mark Enterprise",
      companyAddress: {
        state: "WA",
        city: "Perth",
        postCode: "6000",
        street: "Hasler Rd",
        houseNumber: null,
      },
    });

  const [companyTeamMembers, setCompanyTeamMembers] = useState<
    TeamMember[] | null
  >([]);

  const [companyStandardCompliance, setCompanyStandardCompliance] = useState<
    Documents[] | null
  >([]);

  useEffect(() => {
    // get company information
    // get company team members
    // get company doc information
  }, []);

  // on cancel -> fetch data from network  and restore fields and files. check if there is a change in the information/data.
  // on submit -> send a request to the network
  // on navigating to the another page: check if the states have been changed..

  return (
    <>
      <div className="flex flex-1 flex-col bg-background text-foreground">
        <header className="w-full flex flex-col gap-4 border- px-4 py-3">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-3xl">Settings</h1>
            <p>Manage your company workspace configuration</p>
          </div>
        </header>

        <main className="h-full w-full flex flex-col gap-6 p-4 scroll-auto ">
          <CompanyProfile
            companyInformation={companyProfile}
            updateCompanyInformation={setCompanyInformation}
          />
          <CompanyTeamMembers
            companyTeamMembers={companyTeamMembers}
            updateTeamMember={setCompanyTeamMembers}
          />
          <CompanyStandardsComplaintsDocs
            editCompanyStandardCompliantDocs={setCompanyStandardCompliance}
            companyStandardsComplaintsDocs={companyStandardCompliance}
          />
          <div className="w-full flex flex-row gap-3 justify-items-end">
            <button
              onClick={() => {
                RestoreFieldsFiles(
                  setCompanyInformation,
                  setCompanyTeamMembers,
                  setCompanyStandardCompliance,
                );
              }}
              className="cursor-pointer rounded-xl border p-3 hover:bg-zinc-400 bg-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                updateFieldFiles({
                  companyInformationUpdate: companyProfile,
                  companyInformationStateUpdater: setCompanyInformation,
                  teamMemberUpdates: companyTeamMembers,
                  teamMemberStateUpdater: setCompanyTeamMembers,
                  standardAndComplianceUpdates: companyStandardCompliance,
                  standardAndComplianceUpdater: setCompanyStandardCompliance,
                });
              }}
              className="cursor-pointer hover:bg-zinc-600 bg-zinc-900 text-white p-3 rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
