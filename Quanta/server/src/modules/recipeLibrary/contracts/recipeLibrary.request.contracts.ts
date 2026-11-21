import type { z } from 'zod';
import type {
  archiveRecipeSchema,
  createBuildingClassSchema,
  createCatalogueItemSchema,
  createCategorySchema,
  createRecipeSchema,
  createSiteClassSchema,
  getRecipesQuerySchema,
  recipeCategoriesQuerySchema,
  updateRecipeSchema,
} from '@/modules/recipeLibrary/contracts/recipeLibrary.schema';

// The bodies and queries the routes accept come from the Zod schemas in
// recipeLibrary.schema.ts, so the rules and the types can't drift apart. Each
// is what the route receives once ZodValidationPipe has checked it: text
// tidied, ids present, quantities real numbers above zero.

// The query of GET .../categories: each class is an id, or "all"
export type RecipeCategoriesQuery = z.output<typeof recipeCategoriesQuerySchema>;

// The query of GET .../recipes: filters default to "all", the term is undefined
// when blank, and page / limit are whole numbers kept in range
export type GetRecipesQuery = z.output<typeof getRecipesQuerySchema>;

// The body of PATCH /:companyId/recipe-library/recipes/:recipeId. The company
// and recipe come from the URL and the user from the Clerk token.
//
// `ingredients` is the list of lines to KEEP, each with its new quantity per
// 1 unit of the recipe. Any existing line left out is removed. Materials can't
// be added here, and a recipe's unit never changes, because that would change
// what every quantity means.
export type UpdateRecipeRequest = z.output<typeof updateRecipeSchema>;

// The body of PATCH .../recipes/:recipeId/archive
export type ArchiveRecipeBody = z.output<typeof archiveRecipeSchema>;

// What the repository needs. By the time it runs, the caller has been checked to
// own the company (see AccessService) and the paging has been kept in range.
//
// buildingClassId / siteClassId: a class's id, or "all" (or missing) for every
// class. They narrow the recipes counted in each category.
export type UserRecipeCategoriesRequest = {
  companyId: string;
  userId: string;
  buildingClassId?: string;
  siteClassId?: string;
};

export type GetRecipesRequest = {
  companyId: string;
  userId: string;
  // a category's id, or "all"
  categoryId: string;
  // a building class's id, or "all"
  buildingClassId?: string;
  // a site class's id, or "all"
  siteClassId?: string;
  term?: string;
  archived: boolean;
  page: number;
  limit: number;
};

// What the repository needs to list the user's site classes and building
// classes, with the company's recipe count for each
export type GetRecipeClassificationsRequest = {
  companyId: string;
  userId: string;
};

export type UpdateRecipeRecord = {
  companyId: string;
  userId: string;
  recipeId: string;
  name: string;
  description: string | null;
  categoryId: string;
  ingredients: { id: string; quantity: number }[];
};

export type CatalogueKind = 'material' | 'labour' | 'overhead';

// What the repository needs to list the catalogue. By the time it runs, the
// caller has been checked to own the company (see AccessService).
export type GetRecipeCatalogueRequest = {
  companyId: string;
  userId: string;
};

// The body of POST .../recipe-library/catalogue-items. `labourType` only
// applies to labour and is null for the others.
export type CreateCatalogueItemInput = z.output<typeof createCatalogueItemSchema>;

export type CreateCatalogueItemRecord = CreateCatalogueItemInput & {
  companyId: string;
  userId: string;
};

// The body of POST .../recipe-library/site-classes and .../building-classes.
// The description is shown after the name or on hover in the library, so it is
// kept short.
export type CreateSiteClassInput = z.output<typeof createSiteClassSchema>;
export type CreateBuildingClassInput = z.output<typeof createBuildingClassSchema>;
export type CreateClassInput = CreateSiteClassInput;

// What the repository stores once the name has been checked as new for the user
export type CreateClassRecord = CreateClassInput & {
  userId: string;
};

export type CreateSiteClassRecord = CreateClassRecord;
export type CreateBuildingClassRecord = CreateClassRecord;

// The body of POST .../recipe-library/categories
export type CreateCategoryInput = z.output<typeof createCategorySchema>;

export type CreateCategoryRecord = CreateCategoryInput & {
  companyId: string;
  userId: string;
};

// One component of a new recipe: the catalogue item and how much of it 1 unit
// of the recipe needs. The component's unit is not sent: it is the item's own unit.
export type RecipeComponentInput = CreateRecipeInput['materials'][number];

// The body of POST .../recipe-library/recipes
//
// buildingClassIds / siteClassIds: the classes the recipe suits. Optional; a
// recipe with none only shows when the library is set to "all" for that class.
// Repeated ids have already been dropped. `description` is null when blank.
export type CreateRecipeInput = z.output<typeof createRecipeSchema>;

// The repository picks the recipe's form itself (the Rate-based one, for now),
// so callers send no formId.
export type CreateRecipeRecord = CreateRecipeInput & {
  companyId: string;
  userId: string;
};

export type CatalogueCategory = { id: string; name: string };

// A material, labour or overhead as the recipe form lists it
export type CatalogueItem = {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
};

export type GetRecipeCatalogueResponse = {
  categories: CatalogueCategory[];
  materials: CatalogueItem[];
  labour: CatalogueItem[];
  overheads: CatalogueItem[];
};

export type CreateCatalogueItemResponse = CatalogueItem;

export type CreateCategoryResponse = CatalogueCategory;