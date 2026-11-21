import { z } from 'zod';
import { MAX_NAME, requiredText, tidy } from '@/modules/recipeLibrary/contracts/recipe.fields'

// The rules for the recipe library's routes, checked by ZodValidationPipe
// before each route runs. A bad body or query gets a 400 and never reaches the
// service. Text is tidied (trimmed, runs of spaces squeezed to one).

// The id that means "every category / building class / site class"
export const ALL_ID = 'all';

// The most recipes one page may hold, however large a limit is asked for
export const MAX_PAGE_SIZE = 50;

// The longest a site class or building class name may be. It sits on a chip.
export const MAX_CLASS_NAME = 40;

// A unit such as "m²", "Nr" or "hr"
const MAX_UNIT = 20;

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

// An id from the URL or the body. Only its presence is checked here: the
// service checks that the thing it names is really the caller's.
function id(message: string) {
  return z.string({ error: message }).trim().min(1, message);
}

// Optional text that becomes null when it is missing or blank
function nullableText() {
  return z
    .string()
    .nullish()
    .transform((text) => {
      const tidied = text == null ? '' : tidy(text);
      return tidied === '' ? null : tidied;
    });
}

// A quantity per 1 unit of the recipe: a real number above zero
const quantity = z
  .number({ error: 'Every quantity must be a number.' })
  .finite('Every quantity must be a number.')
  .gt(0, 'Every quantity must be above zero.');

// A list of ids with no blanks; repeats are dropped
function idList(label: string) {
  return z
    .array(id(`A ${label} entry has no id.`), {
      error: `Expected a list of ${label} ids.`,
    })
    .transform((ids) => [...new Set(ids)]);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

// A class or category filter: an id, or "all" when none was given
const filterId = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' ? ALL_ID : trimmed;
  });

// A whole number from the query string, or `fallback` when none was given.
// Out-of-range values are pulled into range rather than refused, so an old link
// with page=0 still opens the first page.
function pageNumber(fallback: number, min: number, max: number) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value.trim() === '') return fallback;
      const number = Number(value);
      if (!Number.isInteger(number)) {
        ctx.addIssue({ code: 'custom', message: 'Expected a whole number.' });
        return z.NEVER;
      }
      return Math.min(Math.max(number, min), max);
    });
}

// GET .../categories?buildingClassId=&siteClassId=
export const recipeCategoriesQuerySchema = z.object({
  buildingClassId: filterId,
  siteClassId: filterId,
});

// GET .../recipes?categoryId=&buildingClassId=&siteClassId=&term=&archived=&page=&limit=
export const getRecipesQuerySchema = z.object({
  categoryId: filterId,
  buildingClassId: filterId,
  siteClassId: filterId,
  term: z
    .string()
    .optional()
    .transform((value) => {
      const tidied = value === undefined ? '' : tidy(value);
      return tidied === '' ? undefined : tidied;
    }),
  // "true" shows the archived recipes; anything else the live ones
  archived: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  page: pageNumber(1, 1, Number.MAX_SAFE_INTEGER),
  limit: pageNumber(10, 1, MAX_PAGE_SIZE),
});

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------

// POST .../site-classes and .../building-classes   { name, description }
function classSchema(label: string) {
  return z.object({
    name: requiredText(`Give the ${label} a name.`, MAX_CLASS_NAME),
    description: requiredText(`Describe the ${label}.`),
  });
}
export const createSiteClassSchema = classSchema('site class');
export const createBuildingClassSchema = classSchema('building class');

// POST .../categories   { name }
export const createCategorySchema = z.object({
  name: requiredText('Give the category a name.', MAX_NAME),
});

// POST .../catalogue-items   { kind, name, unit, categoryId, labourType }
// Labour also needs a type (trade, labourer...); for the other kinds the type
// is ignored and stored as null.
export const createCatalogueItemSchema = z
  .object({
    kind: z.enum(['material', 'labour', 'overhead'], {
      error: 'The kind must be material, labour or overhead.',
    }),
    name: requiredText('A name is required.', MAX_NAME),
    unit: requiredText('A unit is required.', MAX_UNIT),
    categoryId: id('A category is required.'),
    labourType: nullableText(),
  })
  .superRefine((item, ctx) => {
    if (item.kind === 'labour' && item.labourType === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['labourType'],
        message: 'A labour type is required.',
      });
    }
  })
  .transform((item) => ({
    ...item,
    labourType: item.kind === 'labour' ? item.labourType : null,
  }));

// One component of a new recipe: a catalogue item and how much of it 1 unit of
// the recipe needs
const recipeComponentSchema = z.object({
  itemId: id('A component has no item.'),
  quantity,
});

// A section of components (materials, labour or overheads). The same item can't
// be listed twice in one section: it would be two rows for one thing.
function componentSection(label: string) {
  return z
    .array(recipeComponentSchema, { error: `Expected a list of ${label}.` })
    .superRefine((components, ctx) => {
      const seen = new Set<string>();
      components.forEach((component, index) => {
        if (seen.has(component.itemId)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'itemId'],
            message: `A ${label} item is listed twice.`,
          });
        }
        seen.add(component.itemId);
      });
    });
}

// POST .../recipes
// { name, categoryId, unit, description, materials, labour, overheads,
//   buildingClassIds?, siteClassIds? }
// A recipe needs at least one component across the three sections.
export const createRecipeSchema = z
  .object({
    name: requiredText('Give the recipe a name.', MAX_NAME),
    categoryId: id('Choose a category.'),
    unit: requiredText('A unit is required.', MAX_UNIT),
    description: nullableText(),
    materials: componentSection('material'),
    labour: componentSection('labour'),
    overheads: componentSection('overhead'),
    buildingClassIds: idList('building class').optional(),
    siteClassIds: idList('site class').optional(),
  })
  .superRefine((recipe, ctx) => {
    if (
      recipe.materials.length + recipe.labour.length + recipe.overheads.length ===
      0
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['materials'],
        message: 'A recipe needs at least one component.',
      });
    }
  });

// PATCH .../recipes/:recipeId
// { name, description?, categoryId, ingredients: [{ id, quantity }] }
// `ingredients` is the lines to KEEP, each with its new quantity. At least one,
// and each line only once. The service checks every id is one of this recipe's.
export const updateRecipeSchema = z.object({
  name: requiredText('Give the recipe a name.', MAX_NAME),
  description: z
    .string()
    .optional()
    .transform((text) => (text === undefined ? undefined : tidy(text))),
  categoryId: id('Choose a category.'),
  ingredients: z
    .array(
      z.object({
        id: id('Every material needs an id.'),
        quantity,
      }),
      { error: 'Expected a list of materials.' },
    )
    .min(1, 'A recipe needs at least one material.')
    .superRefine((lines, ctx) => {
      const seen = new Set<string>();
      lines.forEach((line, index) => {
        if (seen.has(line.id)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'id'],
            message: 'A material can only appear once.',
          });
        }
        seen.add(line.id);
      });
    }),
});

// PATCH .../recipes/:recipeId/archive   { archived: boolean }
export const archiveRecipeSchema = z.object({
  archived: z.boolean({ error: '"archived" must be true or false.' }),
});