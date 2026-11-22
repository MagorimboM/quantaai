// The body of POST /workspaces/create, as the route receives it once
// ZodValidationPipe has checked it against createWorkspaceSchema. The user
// comes from the Clerk token, so no userId is accepted.
//
// Every company detail and the contact's name are required; the contact's
// phone and email are undefined when left blank. Text is trimmed with single
// spaces inside, emails are trimmed, and phone numbers are in international
// form (+61412345678).
//
// The type is defined next to the schema, so the rules and the type can't
// drift apart.
import type {
  CompanyPolicyFile,
} from '@/modules/workspace/contracts/workspace.schema';
export type { CreateWorkspaceRequest } from '@/modules/workspace/contracts/workspace.schema';

// The uploaded policy PDF, as Multer hands it over once companyPolicyFileSchema
// has checked it. Its bytes are in `buffer`; `originalname`, `mimetype` and
// `size` describe the file.
export type { CompanyPolicyFile } from '@/modules/workspace/contracts/workspace.schema';

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
  chunkedCompanyPolicy: {
    documentTitle: string;
    documentPageNumber: string | number;
    chunkedContent: string[];
  }[];

  companyPolicy: CompanyPolicyFile
};
