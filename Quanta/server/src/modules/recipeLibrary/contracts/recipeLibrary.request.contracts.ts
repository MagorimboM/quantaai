// The body of PATCH /:companyId/recipe-library/recipes/:recipeId. The company
// and recipe come from the URL and the user from the Clerk token.
//
// `ingredients` is the list of lines to KEEP, each with its new quantity per
// 1 unit of the recipe. Any existing line left out is removed. Materials can't
// be added here, and a recipe's unit never changes, because that would change
// what every quantity means.
export type UpdateRecipeRequest = {
  name: string;
  description?: string;
  categoryId: string;
  ingredients: { id: string; quantity: number }[];
};

// The body of PATCH .../recipes/:recipeId/archive
export type ArchiveRecipeBody = {
  archived: boolean;
};

// What the repository needs. By the time it runs, the caller has been checked to
// own the company (see AccessService) and the paging has been kept in range.
export type UserRecipeCategoriesRequest = {
  companyId: string;
  userId: string;
};

export type GetRecipesRequest = {
  companyId: string;
  userId: string;
  // a category's id, or "all"
  categoryId: string;
  term?: string;
  archived: boolean;
  page: number;
  limit: number;
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
export type CreateCatalogueItemInput = {
  kind: CatalogueKind;
  name: string;
  unit: string;
  categoryId: string;
  labourType: string | null;
};
 
export type CreateCatalogueItemRecord = CreateCatalogueItemInput & {
  companyId: string;
  userId: string;
};
 
// The body of POST .../recipe-library/categories
export type CreateCategoryInput = {
  name: string;
};
 
export type CreateCategoryRecord = CreateCategoryInput & {
  companyId: string;
  userId: string;
};
 
// One component of a new recipe: the catalogue item and how much of it 1 unit
// of the recipe needs. The component's unit is not sent: it is the item's own unit.
export type RecipeComponentInput = {
  itemId: string;
  quantity: number;
};
 
// The body of POST .../recipe-library/recipes
export type CreateRecipeInput = {
  name: string;
  categoryId: string;
  // What the recipe is priced per, for example m² for a wall
  unit: string;
  description: string | null;
  materials: RecipeComponentInput[];
  labour: RecipeComponentInput[];
  overheads: RecipeComponentInput[];
};
 
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
 