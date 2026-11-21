import { z } from 'zod';
import {
  companyDetailsFields,
  optionalPhone,
  optionalText,
  requiredEmail,
  requiredText,
} from '@/modules/settings/contracts/settings.fields';

// The rules for the settings routes, checked by ZodValidationPipe before each
// route runs. Text is tidied, a blank optional detail arrives as undefined, and
// phone numbers arrive in international form (+61412345678).

// PUT /:companyId/settings/profile: the same company details collected when the
// workspace was created. Only the name is required.
export const updateCompanyProfileSchema = z.object(companyDetailsFields);

// POST /:companyId/settings/team: a contact for the company, not a Quanta user.
// The name, last name and email are required; the phone and position are not.
export const addTeamMemberSchema = z.object({
  name: requiredText('Enter their first name.'),
  lastName: requiredText('Enter their last name.'),
  email: requiredEmail('Enter their email.'),
  phoneNumber: optionalPhone(),
  position: optionalText(),
});
