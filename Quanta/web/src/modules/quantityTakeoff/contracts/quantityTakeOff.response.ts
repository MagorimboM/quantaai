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