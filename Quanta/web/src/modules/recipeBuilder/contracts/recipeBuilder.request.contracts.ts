// None of these carry a userId: the backend identifies the user from the Clerk
// token and checks the company belongs to them.

// The choices the form offers (recipe types, site conditions, building classes,
// site classes) for a company
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
//
// buildingClassIds: the building classes the recipe suits. At least one: the
//   library is always narrowed to a building class, so a recipe with none
//   would never show.
// siteClassIds: the site (soil) classes it suits. Empty = it suits any site,
//   and only shows under "All sites".
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
  buildingClassIds: string[];
  siteClassIds: string[];
};

// A site class the user is adding, for example a local soil type. The
// description is shown after the name, so keep it short.
export type CreateSiteClassRequest = {
  companyId: string;
  name: string;
  description: string;
};