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

export type CreateRecipeRequest = {
  categoryId: string;
  // null or missing = a general recipe, not tied to a ground condition
  siteConditionId?: string | null;
  name: string;
  description?: string;
  unit: string;
  ingredients: IngredientInput[];
};

// Query parameters of GET /:companyId/recipe/new-recipe/materials. All optional.
export type SearchMaterialsRequest = {
  term?: string;
  categoryId?: string;
  siteConditionId?: string;
};

// What the repository stores once everything has been checked
export type NewRecipeRecord = {
  companyId: string;
  userId: string;
  categoryId: string;
  siteConditionId: string | null;
  name: string;
  description: string | null;
  unit: string;
  ingredients: { materialId: string; quantity: number; unit: string }[];
};