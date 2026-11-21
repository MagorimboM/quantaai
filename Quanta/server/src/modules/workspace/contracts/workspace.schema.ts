import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// The rules for POST /workspaces/create, checked by ZodValidationPipe before the
// route runs. Only the name is required; any detail left blank arrives at the
// service as undefined, the same as if it had been left out.
//
// Every piece of text is tidied first: spaces at the start and end are removed,
// and runs of spaces inside become one ("ABC   Construction" -> "ABC Construction").

// Phone numbers are read as Australian when they have no country code, so
// "0412 345 678" and "+61 412 345 678" are both accepted.
const DEFAULT_PHONE_COUNTRY = 'AU';

// The most a single field may hold, so nobody can store a novel in "city"
const MAX_NAME = 120;
const MAX_TEXT = 200;

// Trims the text and squeezes repeated spaces (and tabs or line breaks) into one
function tidy(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

// Tidied text, or undefined when it is missing or blank
function optionalText(max: number) {
  return z
    .string()
    .optional()
    .transform((text) => (text === undefined ? '' : tidy(text)))
    .pipe(z.string().max(max, `Keep this to ${max} characters or fewer.`))
    .transform((text) => (text === '' ? undefined : text));
}

// An email address, or undefined when it is missing or blank
function optionalEmail() {
  return z
    .string()
    .optional()
    .transform((text) => (text === undefined ? '' : text.trim()))
    .pipe(z.union([z.literal(''), z.email('Enter a valid email address.')]))
    .transform((text) => (text === '' ? undefined : text));
}

// A phone number, or undefined when it is missing or blank. A real number is
// stored in international form (+61412345678), however it was typed.
function optionalPhone() {
  return z
    .string()
    .optional()
    .transform((text, ctx) => {
      const trimmed = text?.trim() ?? '';
      if (trimmed === '') return undefined;

      const phone = parsePhoneNumberFromString(trimmed, DEFAULT_PHONE_COUNTRY);
      if (!phone || !phone.isValid()) {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid phone number.' });
        return z.NEVER;
      }
      return phone.number;
    });
}

export const createWorkspaceSchema = z.object({
  name: z
    .string({ error: 'Enter the company name.' })
    .transform(tidy)
    .pipe(
      z
        .string()
        .min(1, 'Enter the company name.')
        .max(MAX_NAME, `Keep the company name to ${MAX_NAME} characters or fewer.`),
    ),
  address: optionalText(MAX_TEXT),
  city: optionalText(MAX_TEXT),
  state: optionalText(MAX_TEXT),
  postcode: optionalText(20),
  country: optionalText(MAX_TEXT),
  phone: optionalPhone(),
  email: optionalEmail(),
  contactName: optionalText(MAX_TEXT),
  contactPhone: optionalPhone(),
  contactEmail: optionalEmail(),
  companyType: optionalText(MAX_TEXT),
});