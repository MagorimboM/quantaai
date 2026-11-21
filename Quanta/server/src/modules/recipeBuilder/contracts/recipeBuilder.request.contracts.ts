// The body of POST /:companyId/recipe/new-recipe. The company comes from the
// URL and the user from the Clerk token, so neither is accepted from the body.
//
// A recipe is what goes into ONE unit of work. Each ingredient's quantity is the
// amount needed per 1 `unit` of the recipe (60 bricks per 1 m²). The ingredient's
// own unit is not sent: it is taken from the material, so the two can't disagree.
export type IngredientInput = {
  materialId: string;
  quantity: number;
};

// buildingClassIds: the building classes the recipe suits. At least one: the
//   library is always narrowed to a building class, so a recipe with none
//   would never show.
// siteClassIds: the site (soil) classes it suits. Missing or empty = it suits
//   any site, and only shows under "All sites".
export type CreateRecipeRequest = {
  categoryId: string;
  // null or missing = a general recipe, not tied to a ground condition
  siteConditionId?: string | null;
  name: string;
  description?: string;
  unit: string;
  ingredients: IngredientInput[];
  buildingClassIds: string[];
  siteClassIds?: string[];
};

// Query parameters of GET /:companyId/recipe/new-recipe/materials. All optional.
export type SearchMaterialsRequest = {
  term?: string;
  categoryId?: string;
  siteConditionId?: string;
};

// What the repository stores once everything has been checked. The class ids
// have no repeats and are all the user's own.
export type NewRecipeRecord = {
  companyId: string;
  userId: string;
  categoryId: string;
  siteConditionId: string | null;
  name: string;
  description: string | null;
  unit: string;
  ingredients: { materialId: string; quantity: number; unit: string }[];
  buildingClassIds: string[];
  siteClassIds: string[];
};

// The body of POST /:companyId/recipe/new-recipe/site-classes. The
// description is shown after the name in the library, so it is kept short.
export type CreateSiteClassRequest = {
  name: string;
  description: string;
};

// What the repository stores once the name has been checked as new for the user
export type NewSiteClassRecord = CreateSiteClassRequest & {
  userId: string;
};