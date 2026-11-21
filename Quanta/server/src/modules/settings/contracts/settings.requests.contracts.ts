import type { z } from 'zod';
import type {
  addTeamMemberSchema,
  updateCompanyProfileSchema,
} from '@/modules/settings/contracts/settings.schema';

// The request types come from the Zod schemas in settings.schema.ts, so the
// rules and the types can't drift apart. Each is the body as the route receives
// it once ZodValidationPipe has checked it: text tidied, blank optional details
// undefined, phone numbers in international form (+61412345678).

// The body of PUT /:companyId/settings/profile. The company comes from the URL
// and the user from the Clerk token, so neither is accepted from the body.
// These are the same fields collected when a company workspace is created.
export type UpdateCompanyProfileRequest = z.output<typeof updateCompanyProfileSchema>;

// The body of POST /:companyId/settings/team. A team member is a contact for the
// company, not a Quanta user.
export type AddTeamMemberRequest = z.output<typeof addTeamMemberSchema>;

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