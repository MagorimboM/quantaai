import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

// The rules for a new project, in one place. The form checks them before it
// sends anything, and the backend can check the same rules again (it must:
// anyone can call the API without the form).
//
// Text is trimmed before it is checked, so "   " counts as empty.

// A required piece of text. `null` (an untouched postcode) counts as missing.
function requiredText(message: string) {
  return z.string({ error: message }).trim().min(1, message);
}

// A required phone number in international form (+61412345678), as
// PhoneInput gives it
function requiredPhone(emptyMessage: string) {
  return z
    .string({ error: emptyMessage })
    .min(1, emptyMessage)
    .refine((value) => value === "" || isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    });
}

export const newProjectSchema = z.object({
  // Project details
  projectName: requiredText("Give the project a name."),
  projectDescription: requiredText("Describe the project."),
  projectType: requiredText("Enter the project type."),
  projectNumber: requiredText("Enter the project number."),

  // Site
  projectContactName: requiredText("Enter the site contact's name."),
  projectPhoneNumber: requiredPhone("Enter the site contact's phone number."),
  projectAddress: requiredText("Enter the site address."),
  projectCity: requiredText("Enter the city."),
  projectPostCode: requiredText("Enter the postcode."),
  projectState: requiredText("Enter the state."),
  projectCountry: requiredText("Enter the country."),

  // Client
  clientName: requiredText("Enter the client's name."),
  clientEmail: z
    .string()
    .trim()
    .min(1, "Enter the client's email.")
    .pipe(z.email("Enter a valid email address.")),
  clientPhoneNumber: requiredPhone("Enter the client's phone number."),
});

// The form's fields, as Zod checks them
export type NewProjectFields = z.infer<typeof newProjectSchema>;
export type NewProjectField = keyof NewProjectFields;

// One message per field that is wrong (the first problem found for it), or an
// empty object when everything is fine
export type NewProjectErrors = Partial<Record<NewProjectField, string>>;

export function validateNewProject(values: unknown): {
  data: NewProjectFields | null;
  errors: NewProjectErrors;
} {
  const result = newProjectSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} };

  const errors: NewProjectErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as NewProjectField;
    errors[field] ??= issue.message;
  }
  return { data: null, errors };
}