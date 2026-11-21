import { z } from 'zod';

// The rules for the documents routes, checked by ZodValidationPipe before each
// route runs. A bad body or URL gets a 400 and never reaches the service.
//
// The uploaded files themselves aren't JSON, so they are checked separately by
// FileValidationPipe (at least one file, each a real PDF).

// Which of the user's three document shelves a file goes on:
//  - projectDocument: uploaded against one project (that job's specs and drawings)
//  - companyDocument: uploaded against the company, used across its projects
//  - userDocument:    personal, kept outside any company or project
export const DOCUMENT_TYPES = [
  'projectDocument',
  'companyDocument',
  'userDocument',
] as const;

// An id from the URL or the body. Only its presence is checked here: the
// controller and service check that the thing it names is really the caller's.
function id(message: string) {
  return z.string({ error: message }).trim().min(1, message);
}

// POST /:companyId/files/upload   multipart form: files + { projectId, documentType? }
// Form fields arrive as text. Without a documentType the files go on the
// project's shelf.
export const uploadFilesBodySchema = z.object({
  projectId: id('Say which project the files are for.'),
  documentType: z
    .enum(DOCUMENT_TYPES, {
      error: 'The document type must be projectDocument, companyDocument or userDocument.',
    })
    .default('projectDocument'),
});

// GET /:companyId/files/:projectId
export const getFilesParamsSchema = z.object({
  companyId: id('The company is missing.'),
  projectId: id('The project is missing.'),
});

// DELETE /:companyId/files/:projectId/:documentId
export const deleteFilesParamsSchema = getFilesParamsSchema.extend({
  documentId: id('The document is missing.'),
});