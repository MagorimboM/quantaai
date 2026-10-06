// None of these carry a userId: the backend identifies the user from the Clerk
// token and checks the company belongs to them.

// The choices the form offers (recipe types, site conditions) for a company
export type RecipeBuilderOptionsRequest = {
  companyId: string;
};

// Looks up the company's materials to add to a recipe. Every filter is
// optional: a name fragment, one category, and the recipe's site condition.
// With a site condition chosen, materials made for that ground are included
// as well as general ones; with none, only general materials are offered.
export type SearchMaterialsRequest = {
  companyId: string;
  term?: string;
  categoryId?: string;
  siteConditionId?: string;
};

// A new recipe: what goes into ONE unit of work. Each ingredient's quantity is
// the amount needed per 1 `unit` of the recipe (for example 60 bricks per 1 m²).
export type CreateRecipeRequest = {
  companyId: string;
  categoryId: string;
  // null = a general recipe, not tied to a ground condition
  siteConditionId: string | null;
  name: string;
  description: string;
  unit: string;
  ingredients: {
    materialId: string;
    quantity: number;
  }[];
};