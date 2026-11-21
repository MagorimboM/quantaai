import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

// The rules for a new company workspace, in one place. The form checks them
// before it sends anything, and the backend can check the same rules again (it
// must: anyone can call the API without the form).
//
// Text is trimmed before it is checked, so "   " counts as empty.

function requiredText(message: string) {
  return z.string({ error: message }).trim().min(1, message);
}

// A phone number in international form (+61412345678), as PhoneInput gives it.
// With `emptyMessage` it is required; without, it may be left empty.
function phone(emptyMessage?: string) {
  return z
    .string()
    .refine((value) => value !== "" || emptyMessage === undefined, {
      message: emptyMessage,
    })
    .refine((value) => value === "" || isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    });
}

// An email address. With `emptyMessage` it is required; without, it may be
// left empty.
function email(emptyMessage?: string) {
  const address = z.email("Enter a valid email address.");
  return emptyMessage
    ? z.string().trim().min(1, emptyMessage).pipe(address)
    : z.string().trim().pipe(z.union([z.literal(""), address]));
}

export const createCompanyWorkspaceSchema = z.object({
  // The company
  name: requiredText("Enter the company name."),
  companyType: requiredText("Enter the company type."),
  address: requiredText("Enter the address."),
  city: requiredText("Enter the city."),
  state: requiredText("Enter the state."),
  postcode: requiredText("Enter the postcode."),
  country: requiredText("Enter the country."),
  phone: phone("Enter the company phone number."),
  email: email("Enter the company email."),

  // The primary contact: a name is required, the phone and email are optional
  contactName: requiredText("Enter the contact's name."),
  contactPhone: phone(),
  contactEmail: email(),
});

// The form's fields, as Zod checks them
export type CompanyWorkspaceFields = z.infer<typeof createCompanyWorkspaceSchema>;
export type CompanyWorkspaceField = keyof CompanyWorkspaceFields;

// One message per field that is wrong (the first problem found for it), or an
// empty object when everything is fine
export type CompanyWorkspaceErrors = Partial<Record<CompanyWorkspaceField, string>>;

export function validateCompanyWorkspace(values: unknown): {
  data: CompanyWorkspaceFields | null;
  errors: CompanyWorkspaceErrors;
} {
  const result = createCompanyWorkspaceSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} };

  const errors: CompanyWorkspaceErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as CompanyWorkspaceField;
    errors[field] ??= issue.message;
  }
  return { data: null, errors };
}