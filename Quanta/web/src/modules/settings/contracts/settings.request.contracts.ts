// None of these carry a userId: the backend identifies the user from the Clerk
// token and checks the company belongs to them.

export type GetSettingsRequest = {
  companyId: string;
};

// The company details a user can edit. These are the same fields collected when
// a company workspace is created, so what they typed then is what they edit here.
export type CompanyProfileFields = {
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

export type UpdateCompanyProfileRequest = CompanyProfileFields & {
  companyId: string;
};

// A person to list under the company's team. Team members are a contact list for
// the company; they are not Quanta users and cannot sign in.
export type AddTeamMemberRequest = {
  companyId: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};

export type DeleteTeamMemberRequest = {
  companyId: string;
  memberId: string;
};