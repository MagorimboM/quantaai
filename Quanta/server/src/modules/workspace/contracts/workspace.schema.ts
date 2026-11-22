import { z } from 'zod';
import {
  MAX_NAME,
  requiredText,
  requiredEmail,
  requiredPhone,
  optionalEmail,
  optionalPhone,
} from '@/common/validations/global.input.fields';
import { isPdf } from '@/common/validations/fileUploadValidators/files/pdfFile.validator';

// The rules for POST /workspaces/create, checked by ZodValidationPipe before the
// route runs. They match the form's rules (createCompanyWorkspace.schema.ts on
// the frontend): every company detail and the contact's name are required; the
// contact's phone and email may be left blank, and then arrive at the service
// as undefined.
//
// The field rules themselves (tidying, lengths, email and phone checks) come
// from global.input.fields, so they work the same as on every other route.
// Phones come out in international form (+61412345678), however they were typed.
//
// The request is multipart form data (so it can carry the policy PDF), which
// means every field arrives as text. That suits these rules: they are all text.
//
// The PDF is checked by its own schema, companyPolicyFileSchema, at the end of
// this file. It can't sit inside createWorkspaceSchema because Multer takes the
// file out of the body and hands it to the route separately, as @UploadedFile().
// So the route runs two pipes: one on @Body() and one on @UploadedFile().
//
// Settings uses the looser companyDetailsFields from the same shared file,
// where only the name is required, so a company can be edited a field at a time.

// The most a postcode may hold (room for overseas formats)
const MAX_POSTCODE = 20;

export const createWorkspaceSchema = z.object({
  // The company
  name: requiredText('Enter the company name.', MAX_NAME),
  companyType: requiredText('Enter the company type.'),
  address: requiredText('Enter the address.'),
  city: requiredText('Enter the city.'),
  state: requiredText('Enter the state.'),
  postcode: requiredText('Enter the postcode.', MAX_POSTCODE),
  country: requiredText('Enter the country.'),
  phone: requiredPhone('Enter the company phone number.'),
  email: requiredEmail('Enter the company email.'),

  // The primary contact: a name is required, the phone and email are optional
  contactName: requiredText("Enter the contact's name."),
  contactPhone: optionalPhone(),
  contactEmail: optionalEmail(),
});

// The body as the service receives it: tidied, phones in international form,
// and blank optional details as undefined
export type CreateWorkspaceRequest = z.output<typeof createWorkspaceSchema>;

// The most a policy PDF can weigh. The controller's Multer limit uses the same
// number, so a bigger file is refused before it is even read into memory.
export const MAX_POLICY_BYTES = 10 * 1024 * 1024;

// The company's quants takeoff policy, as Multer hands it over. It's optional:
// with no file the route gets undefined. A file that is sent must be a real PDF
// (its first bytes are checked, not just its name or the type the browser
// claimed) and no bigger than MAX_POLICY_BYTES. Whether it has readable text in
// it is checked by the service when it reads it.
//
// Its problems are reported under the field "file", the same name the form
// sends it with.
export const companyPolicyFileSchema = z
  .custom<Express.Multer.File>(
    (value) =>
      typeof value === 'object' &&
      value !== null &&
      Buffer.isBuffer((value as Express.Multer.File).buffer),
    { message: 'Upload the policy as a file.', path: ['file'] },
  )
  .optional()
  .superRefine((file, ctx) => {
    if (!file) return;

    if (file.size > MAX_POLICY_BYTES) {
      ctx.addIssue({
        code: 'custom',
        message: 'The policy must be 10 MB or smaller.',
        path: ['file'],
      });
      return;
    }
    if (!isPdf(file.buffer)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The company policy must be a PDF.',
        path: ['file'],
      });
    }
  });

// The policy file as the route receives it: a checked PDF, or undefined
export type CompanyPolicyFile = z.output<typeof companyPolicyFileSchema>;