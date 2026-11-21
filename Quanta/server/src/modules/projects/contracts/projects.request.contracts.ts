import type { z } from 'zod';
import type {
  createNewProjectSchema,
  getListOfProjectsQuerySchema,
} from '@/modules/projects/contracts/projects.schema';

// The query and body the routes accept come from the Zod schemas in
// projects.schema.ts, so the rules and the types can't drift apart. Each is
// what the route receives once ZodValidationPipe has checked it.

// The query of GET /:companyId/projects: the term is undefined when blank, and
// page / limit are whole numbers kept in range
export type GetListOfProjectsQuery = z.output<typeof getListOfProjectsQuerySchema>;

// What the repository needs. The caller has already been checked to own the
// company (see AccessService), and page/limit have been kept in a safe range.
export type GetListOfProjectsRequest = {
  companyId: string;
  userId: string;
  term?: string;
  page: number;
  limit: number;
};

// The body of POST /:companyId/projects/new-project, once checked: every field
// present and tidied, phones in international form (+61412345678), the email
// trimmed, and the postcode as text (it can start with 0).
export type CreateNewProjectRequest = z.output<typeof createNewProjectSchema>;