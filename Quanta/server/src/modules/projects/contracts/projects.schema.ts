import { z } from 'zod';
import {
  MAX_NAME,
  optionalQueryText,
  pageNumber,
  requiredEmail,
  requiredPhone,
  requiredText,
  tidy,
} from '@/common/validations/global.input.fields';

// The rules for the projects routes, checked by ZodValidationPipe before each
// route runs. A bad body or query gets a 400 and never reaches the service.
// Text is tidied (trimmed, runs of spaces squeezed to one).
//
// They match the frontend's newProjectForm.schema.ts, so a form that passes
// in the browser passes here too.

// The most projects one page may hold, however large a limit is asked for
export const MAX_PAGE_SIZE = 50;

// GET /:companyId/projects?term=&page=&limit=
export const getListOfProjectsQuerySchema = z.object({
  term: optionalQueryText(),
  page: pageNumber(1, 1, Number.MAX_SAFE_INTEGER),
  limit: pageNumber(10, 1, MAX_PAGE_SIZE),
});

// A postcode, kept as text: Australian postcodes can start with 0 (Darwin is
// "0800"), which a number would drop. A number is accepted too, from older
// screens that sent one.
const postcode = z
  .union([z.string(), z.number()], { error: 'Enter the postcode.' })
  .transform((value) => tidy(String(value)))
  .pipe(
    z
      .string()
      .min(1, 'Enter the postcode.')
      .max(10, 'Keep the postcode to 10 characters or fewer.'),
  );

// POST /:companyId/projects/new-project
// Every field is required, as on the form. Phone numbers are passed on in
// international form (+61412345678).
export const createNewProjectSchema = z.object({
  // The project
  projectName: requiredText('Give the project a name.', MAX_NAME),
  projectDescription: requiredText('Describe the project.'),
  projectType: requiredText('Enter the project type.'),
  projectNumber: requiredText('Enter the project number.'),

  // The site
  projectContactName: requiredText("Enter the site contact's name."),
  projectPhoneNumber: requiredPhone("Enter the site contact's phone number."),
  projectAddress: requiredText('Enter the site address.'),
  projectCity: requiredText('Enter the city.'),
  projectPostCode: postcode,
  projectState: requiredText('Enter the state.'),
  projectCountry: requiredText('Enter the country.'),

  // The client
  clientName: requiredText("Enter the client's name."),
  clientEmail: requiredEmail("Enter the client's email."),
  clientPhoneNumber: requiredPhone("Enter the client's phone number."),

  // Nothing on the form sets this yet; passed on as null when missing.
  // TODO :: remove it, or say what it holds.
  projectContact: z
    .number({ error: '"projectContact" must be a number.' })
    .nullish()
    .transform((value) => value ?? null),
});