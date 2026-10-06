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