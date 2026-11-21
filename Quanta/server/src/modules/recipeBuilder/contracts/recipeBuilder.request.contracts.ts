import type { z } from 'zod';
import type {
  createRecipeSchema,
  createSiteClassSchema,
  searchMaterialsQuerySchema,
} from '@/modules/recipeBuilder/contracts/recipeBuilder.schema';

// The bodies and queries the routes accept come from the Zod schemas in
// recipeBuilder.schema.ts, so the rules and the types can't drift apart. Each
// is what the route receives once ZodValidationPipe has checked it.

// The body of POST /:companyId/recipe/new-recipe. The company comes from the
// URL and the user from the Clerk token, so neither is accepted from the body.
//
// A recipe is what goes into ONE unit of work. Each ingredient's quantity is the
// amount needed per 1 `unit` of the recipe (60 bricks per 1 m²). The ingredient's
// own unit is not sent: it is taken from the material, so the two can't disagree.
//
// buildingClassIds: the building classes the recipe suits, at least one, no
//   repeats. siteClassIds: the site (soil) classes it suits, no repeats; empty
//   when none were sent (it suits any site, and only shows under "All sites").
// description: undefined when blank.
export type CreateRecipeRequest = z.output<typeof createRecipeSchema>;
export type IngredientInput = CreateRecipeRequest['ingredients'][number];

// Query parameters of GET /:companyId/recipe/new-recipe/materials. Both are
// optional, and undefined when blank.
export type SearchMaterialsRequest = z.output<typeof searchMaterialsQuerySchema>;

// What the repository stores once everything has been checked. The class ids
// have no repeats and are all the user's own.
export type NewRecipeRecord = {
  companyId: string;
  userId: string;
  categoryId: string;
  name: string;
  description: string | null;
  unit: string;
  ingredients: { materialId: string; quantity: number; unit: string }[];
  buildingClassIds: string[];
  siteClassIds: string[];
};

// The body of POST /:companyId/recipe/new-recipe/site-classes. The
// description is shown after the name in the library, so it is kept short.
export type CreateSiteClassRequest = z.output<typeof createSiteClassSchema>;

// What the repository stores once the name has been checked as new for the user
export type NewSiteClassRecord = CreateSiteClassRequest & {
  userId: string;
};