// The body of PUT /:companyId/settings/profile. The company comes from the URL
// and the user from the Clerk token, so neither is accepted from the body.
// These are the same fields collected when a company workspace is created.
export type UpdateCompanyProfileRequest = {
  name: string;
  companyType?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
};

// The body of POST /:companyId/settings/team. A team member is a contact for the
// company, not a Quanta user.
export type AddTeamMemberRequest = {
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
};

// What the repository stores once everything has been checked. Blank optional
// details are stored as null on the company.
export type CompanyProfileRecord = {
  name: string;
  companyType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

export type TeamMemberRecord = {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};