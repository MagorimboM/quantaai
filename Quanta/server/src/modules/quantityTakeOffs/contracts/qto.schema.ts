import { z } from 'zod';
import { requiredText, tidy } from '@/common/validations/global.input.fields';

// The rules for the takeoff's routes, checked by ZodValidationPipe before each
// route runs. A bad body gets a 400 and never reaches the service. Text is
// tidied (trimmed, runs of spaces squeezed to one).
//
// Creating a recipe, a catalogue item or a category from a takeoff follows the
// same rules as the recipe library, so those schemas come from there rather
// than being written twice.
export {
  createCatalogueItemSchema,
  createCategorySchema,
  createRecipeSchema,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.schema';

// An id from the body. Only its presence is checked here: the service checks
// that the thing it names is really the caller's.
function id(message: string) {
  return z.string({ error: message }).trim().min(1, message);
}

// A measurement the recipe is multiplied by: a real number above zero
const measurement = z
  .number({ error: 'Enter the measurement as a number.' })
  .finite('Enter the measurement as a number.')
  .gt(0, 'The measurement must be above zero.');

// Where the line is on the job ("North elevation brick wall"). It is stored in
// the line's `description`.
const location = requiredText('Say where this line is.');

// Optional notes that become null when they are missing or blank
const notes = z
  .string()
  .nullish()
  .transform((text) => {
    const tidied = text == null ? '' : tidy(text);
    return tidied === '' ? null : tidied;
  });

// POST .../bill-of-quantities   { recipeId, measurement, description, notes }
export const addLineItemSchema = z.object({
  recipeId: id('Choose a recipe.'),
  measurement,
  description: location,
  notes,
});

// PUT .../bill-of-quantities   [{ id, description, measurement, notes }, ...]
// The edited lines. Each line only once; the service checks every id is a line
// of this takeoff.
export const updateLineItemsSchema = z
  .array(
    z.object({
      id: id('Every line needs an id.'),
      description: location,
      measurement,
      notes,
    }),
    { error: 'Expected a list of lines.' },
  )
  .superRefine((lines, ctx) => {
    const seen = new Set<string>();
    lines.forEach((line, index) => {
      if (seen.has(line.id)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: 'A line can only be saved once.',
        });
      }
      seen.add(line.id);
    });
  });

// PATCH .../bill-of-quantities/status   { completed: boolean }
export const updateProjectStatusSchema = z.object({
  completed: z.boolean({ error: '"completed" must be true or false.' }),
});

// POST .../bill-of-quantities/delete   { lineItemIds: string[] }
// At least one id; repeats are dropped.
export const deleteLineItemsSchema = z.object({
  lineItemIds: z
    .array(id('A line id is blank.'), { error: 'Expected a list of line ids.' })
    .min(1, 'Choose at least one line to delete.')
    .transform((ids) => [...new Set(ids)]),
});