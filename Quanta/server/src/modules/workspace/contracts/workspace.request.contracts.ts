import type { z } from 'zod';
import type { createWorkspaceSchema } from '@/modules/workspace/contracts/workspace.schema';

// The body of POST /workspaces/create, as the route receives it once
// ZodValidationPipe has checked it against createWorkspaceSchema. The user
// comes from the Clerk token, so no userId is accepted.
//
// Only the name is required. Every other field is undefined when it was left
// out or blank. Text is trimmed with single spaces inside, emails are trimmed,
// and phone numbers are in international form (+61412345678).
//
// The type comes from the schema, so the rules and the type can't drift apart.
export type CreateWorkspaceRequest = z.output<typeof createWorkspaceSchema>;

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