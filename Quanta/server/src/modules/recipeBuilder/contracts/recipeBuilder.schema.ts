import { z } from 'zod';
import { MAX_NAME, requiredText, tidy } from '@/common/validations/global.input.fields';

// The rules for the recipe builder's routes, checked by ZodValidationPipe before
// each route runs. A bad body or query gets a 400 and never reaches the
// service. Text is tidied (trimmed, runs of spaces squeezed to one).

// The longest a site class name may be. It sits on a chip.
export const MAX_SITE_CLASS_NAME = 40;

// A unit such as "m²", "m" or "m³"
const MAX_UNIT = 20;

// An id from the body. Only its presence is checked here: the service checks
// that the thing it names is really the caller's.
function id(message: string) {
  return z.string({ error: message }).trim().min(1, message);
}

// A list of ids with no blanks; repeats are dropped
function idList(label: string) {
  return z
    .array(id(`A ${label} entry has no id.`), {
      error: `Expected a list of ${label} ids.`,
    })
    .transform((ids) => [...new Set(ids)]);
}

// Tidied text, or undefined when it is missing or blank
const optionalTidyText = z
  .string()
  .optional()
  .transform((text) => {
    const tidied = text === undefined ? '' : tidy(text);
    return tidied === '' ? undefined : tidied;
  });

// One ingredient of a new recipe: a material and how much of it 1 unit of the
// recipe needs. Its unit isn't sent: it comes from the material.
const ingredientSchema = z.object({
  materialId: id('Every ingredient needs a material.'),
  quantity: z
    .number({ error: 'Every ingredient needs a quantity above zero.' })
    .finite('Every ingredient needs a quantity above zero.')
    .gt(0, 'Every ingredient needs a quantity above zero.'),
});

// GET .../materials?term=&categoryId=   Both filters are optional.
export const searchMaterialsQuerySchema = z.object({
  term: optionalTidyText,
  categoryId: optionalTidyText,
});

// POST .../site-classes   { name, description }
export const createSiteClassSchema = z.object({
  name: requiredText('Give the site class a name.', MAX_SITE_CLASS_NAME),
  description: requiredText('Describe the site class.'),
});

// POST .../new-recipe
// { name, categoryId, unit, description?, ingredients, buildingClassIds, siteClassIds? }
//
// A recipe needs at least one ingredient (each material only once) and at least
// one building class: the library is always narrowed to a building class, so a
// recipe with none would never show. Site classes are optional (none = it suits
// any site).
export const createRecipeSchema = z.object({
  name: requiredText('Give the recipe a name.', MAX_NAME),
  categoryId: id('Choose a recipe type.'),
  unit: requiredText('Say what the quantities are per.', MAX_UNIT),
  description: optionalTidyText,
  ingredients: z
    .array(ingredientSchema, { error: 'A recipe needs at least one ingredient.' })
    .min(1, 'A recipe needs at least one ingredient.')
    .superRefine((ingredients, ctx) => {
      const seen = new Set<string>();
      ingredients.forEach((ingredient, index) => {
        if (seen.has(ingredient.materialId)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'materialId'],
            message: 'Each ingredient can only be added once.',
          });
        }
        seen.add(ingredient.materialId);
      });
    }),
  buildingClassIds: idList('building class').refine((ids) => ids.length > 0, {
    message: 'Choose at least one building class the recipe suits.',
  }),
  siteClassIds: idList('site class').default([]),
});