import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Field rules shared by the backend's Zod schemas, so a name, an email or a
// phone number is checked and tidied the same way on every route.
//
// Text is tidied first: spaces at the start and end are removed, and runs of
// spaces inside become one ("ABC   Construction" -> "ABC Construction").
// An optional field that is missing or blank comes out as undefined, the same
// as if it had been left out.

// The most a single field may hold, so nobody can store a novel in "city"
export const MAX_NAME = 120;
export const MAX_TEXT = 200;

// Phone numbers are read as Australian when they have no country code, so
// "0412 345 678" and "+61 412 345 678" are both accepted.
const DEFAULT_PHONE_COUNTRY = 'AU';

// Trims the text and squeezes repeated spaces (and tabs or line breaks) into one
export function tidy(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

// Tidied text that must be there
export function requiredText(message: string, max = MAX_TEXT) {
  return z
    .string({ error: message })
    .transform(tidy)
    .pipe(
      z
        .string()
        .min(1, message)
        .max(max, `Keep this to ${max} characters or fewer.`),
    );
}

// Tidied text, or undefined when it is missing or blank
export function optionalText(max = MAX_TEXT) {
  return z
    .string()
    .optional()
    .transform((text) => (text === undefined ? '' : tidy(text)))
    .pipe(z.string().max(max, `Keep this to ${max} characters or fewer.`))
    .transform((text) => (text === '' ? undefined : text));
}

// An email address that must be there, trimmed
export function requiredEmail(message: string) {
  return z
    .string({ error: message })
    .trim()
    .min(1, message)
    .pipe(z.email('Enter a valid email address.'));
}

// An email address, or undefined when it is missing or blank
export function optionalEmail() {
  return z
    .string()
    .optional()
    .transform((text) => (text === undefined ? '' : text.trim()))
    .pipe(z.union([z.literal(''), z.email('Enter a valid email address.')]))
    .transform((text) => (text === '' ? undefined : text));
}

// A phone number, or undefined when it is missing or blank. A real number is
// passed on in international form (+61412345678), however it was typed.
export function optionalPhone() {
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

// The details of a company, as collected when a company workspace is created
// and edited later in Settings. Only the name is required.
export const companyDetailsFields = {
  name: requiredText('Enter the company name.', MAX_NAME),
  companyType: optionalText(),
  address: optionalText(),
  city: optionalText(),
  state: optionalText(),
  postcode: optionalText(20),
  country: optionalText(),
  phone: optionalPhone(),
  email: optionalEmail(),
  contactName: optionalText(),
  contactPhone: optionalPhone(),
  contactEmail: optionalEmail(),
};