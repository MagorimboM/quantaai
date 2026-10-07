// None of these carry a userId: the backend identifies the user from the Clerk
// token and checks the company belongs to them.

export type UserRecipeCategoriesRequest = {
  companyId: string;
};

// One page of recipes. `categoryId` is a real category's id, or "all". `term`
// matches the recipe's name or description. `archived` picks which list: the
// live recipes (false) or the archived ones (true).
export type GetRecipesRequest = {
  companyId: string;
  categoryId: string;
  term?: string;
  archived: boolean;
  page: number;
  limit: number;
};

// An edited recipe. `ingredients` is the list of lines to KEEP, each with its
// quantity per 1 unit of the recipe; any existing line left out is removed.
// A recipe keeps its unit and its materials: only their quantities change here.
export type UpdateRecipeRequest = {
  companyId: string;
  recipeId: string;
  name: string;
  description: string;
  categoryId: string;
  ingredients: { id: string; quantity: number }[];
};

// archived = true hides the recipe from the library; false restores it
export type ArchiveRecipeRequest = {
  companyId: string;
  recipeId: string;
  archived: boolean;
};

export type DeleteRecipeRequest = {
  companyId: string;
  recipeId: string;
};