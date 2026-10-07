// The body of POST /workspaces/create. The user comes from the Clerk token, so
// no userId is accepted. Only the name is required; any detail left blank is
// stored as empty.
export type CreateWorkspaceRequest = {
  name: string;
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
  companyType?: string;
};

// What the repository stores once everything has been checked
export type NewCompanyRecord = {
  userId: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  companyType: string | null;
};