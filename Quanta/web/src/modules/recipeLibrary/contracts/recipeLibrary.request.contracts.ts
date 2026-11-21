// None of these carry a userId: the backend identifies the user from the Clerk
// token and checks the company belongs to them.
//
// buildingClassId / siteClassId: a class's id, or "all" (or left out) for
// every class.

// The site classes and building classes for the two selectors at the top of
// the library
export type GetRecipeClassificationsRequest = {
  companyId: string;
};

// The category counts follow the building class and site class being viewed
export type UserRecipeCategoriesRequest = {
  companyId: string;
  buildingClassId?: string;
  siteClassId?: string;
};

// One page of recipes. `categoryId` is a real category's id, or "all". `term`
// matches the recipe's name or description. `archived` picks which list: the
// live recipes (false) or the archived ones (true).
export type GetRecipesRequest = {
  companyId: string;
  categoryId: string;
  buildingClassId?: string;
  siteClassId?: string;
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

export type CatalogueKind = "material" | "labour" | "overhead";

export type GetRecipeCatalogueRequest = {
  companyId: string;
};

export type CreateCatalogueItemRequest = {
  companyId: string;
  kind: CatalogueKind;
  name: string;
  unit: string;
  categoryId: string;
  // Only labour has a type; null for materials and overheads
  labourType: string | null;
};

export type CreateCategoryRequest = {
  companyId: string;
  name: string;
};

// One thing a recipe is made of and how much of it 1 unit of the recipe needs
export type RecipeComponentRequest = {
  itemId: string;
  quantity: number;
};

// A building class the user is adding, for example "Residential". The
// description is shown on hover, so keep it short.
export type CreateBuildingClassRequest = {
  companyId: string;
  name: string;
  description: string;
};

// A site class the user is adding, for example a local soil type. The
// description is shown after the name, so keep it short.
export type CreateSiteClassRequest = {
  companyId: string;
  name: string;
  description: string;
};

// buildingClassIds / siteClassIds: the classes the recipe suits, chosen in the
// Create recipe form.
export type CreateRecipeRequest = {
  companyId: string;
  name: string;
  categoryId: string;
  // What the recipe is priced per, for example m² for a wall
  unit: string;
  description: string | null;
  materials: RecipeComponentRequest[];
  labour: RecipeComponentRequest[];
  overheads: RecipeComponentRequest[];
  buildingClassIds?: string[];
  siteClassIds?: string[];
};