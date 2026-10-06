// The company as stored: its id plus every editable detail. Details that were
// never filled in come back as empty text, never null.
export type CompanyProfileDetails = {
  id: string;
  name: string;
  companyType: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
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

// A company-level standard or compliance document
export type StandardDocument = {
  id: string;
  name: string;
  documentType: string | null;
  uploadedAt: Date;
};