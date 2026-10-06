import type { CompanyProfileFields } from "@/modules/settings/contracts/settings.request.contracts";

// The company as stored: its id plus every editable field. Fields that were
// never filled in come back as empty text, never null.
export type CompanyProfileDetails = CompanyProfileFields & {
  id: string;
};

export type TeamMember = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};

export type DeleteTeamMemberResponse = {
  success: boolean;
  deletedMemberId: string;
};

// A company-level standard or compliance document. Dates arrive as ISO strings
// over JSON, not Date objects.
export type StandardDocument = {
  id: string;
  name: string;
  documentType: string | null;
  uploadedAt: string;
};