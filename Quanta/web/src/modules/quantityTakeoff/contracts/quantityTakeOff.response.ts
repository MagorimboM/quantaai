// A recipe with everything needed to show its components and calculate their
// totals: each component's quantity is the amount needed per 1 unit of the recipe.
export type RecipeDetail = {
  id: string;
  name: string;
  unit: string;
  category: {
    id: string;
    name: string;
  };
  recipeMaterials: {
    id: string;
    quantity: number;
    unit: string;
    material: {
      id: string;
      name: string;
    };
  }[];
  recipeLabour: {
    id: string;
    quantity: number;
    unit: string;
    labour: {
      id: string;
      name: string;
    };
  }[];
  recipeOverheads: {
    id: string;
    quantity: number;
    unit: string;
    overhead: {
      id: string;
      name: string;
    };
  }[];
};

// One line of the takeoff: a recipe applied to a measurement.
// `description` holds the location ("North, south and west wall").
export type GetBillOfQuantsResponse = {
  id: string;
  description: string;
  measurement: number;
  unit: string;
  notes: string | null;
  recipe: RecipeDetail | null;
};

export type UpdateLineItemsResponse = {
  success: boolean;
  updatedItems: number;
};

export type UpdateProjectStatusResponse = {
  id: string;
  completed: boolean;
};

// The ids of the line items that were deleted
export type DeletedLineItemsResponse = { id: string }[];

export type DeleteProjectBillOfQuantitiesResponse = {
  success: boolean;
  deletedItems: number;
};

// ---- add to the end of quantityTakeOff.response.ts ----

// A recipe as the picker shows it: per-1-unit quantities for everything it
// contains, so the preview can multiply them by the measurement as it is typed.
// TODO :: [backend] `notes` is the recipe's own note (for example a height
// limit). Point it at the real column name.

export type RecipeOption = {
  id: string;
  name: string;
  unit: string;
  description: string | null;
  category: { id: string; name: string };
  recipeMaterials: {
    id: string;
    quantity: number;
    unit: string;
    material: { id: string; name: string };
  }[];
  recipeLabour: {
    id: string;
    quantity: number;
    unit: string;
    labour: { id: string; name: string };
  }[];
  recipeOverheads: {
    id: string;
    quantity: number;
    unit: string;
    overhead: { id: string; name: string };
  }[];
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
 
// The new recipe, shaped like the picker lists recipes
export type CreateRecipeResponse = RecipeOption;
 
export type GetRecipeOptionsResponse = RecipeOption[];