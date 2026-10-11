// None of these carry a userId: the backend identifies the user from the Clerk
// token and checks the company and project belong to them.

// The takeoff of one project
export type GetProjectBillOfQuantsRequest = {
  companyId: string;
  projectId: string;
};

// What gets saved for a line item. Only these three fields are editable on the
// page: the location (stored in `description`), the notes, and the measurement
// every quantity is calculated from. The recipe and unit are fixed.
export type LineItemInput = {
  id: string;
  description: string;
  measurement: number;
  notes: string | null;
};

export type UpdateLineItemsRequest = {
  companyId: string;
  projectId: string;
  lineItems: LineItemInput[];
};

// Marks the project's takeoff complete (true) or reopens it (false)
export type UpdateProjectStatusRequest = {
  companyId: string;
  projectId: string;
  completed: boolean;
};

export type DeleteLineItemsRequest = {
  companyId: string;
  projectId: string;
  lineItemIds: string[];
};

// Removes every line item of the project ("start afresh")
export type DeleteProjectBillOfQuantitiesRequest = {
  companyId: string;
  projectId: string;
};

export type GetRecipeOptionsRequest = {
  companyId: string;
  projectId: string;
};
 
// One new takeoff line: a recipe, the one measurement it is multiplied by, and
// where it is. `description` holds the location (see lineItem.tsx).
export type AddLineItemRequest = {
  companyId: string;
  projectId: string;
  recipeId: string;
  measurement: number;
  description: string;
  notes: string | null;
};

export type CatalogueKind = "material" | "labour" | "overhead";
 
export type GetRecipeCatalogueRequest = {
  companyId: string;
  projectId: string;
};
 
export type CreateCatalogueItemRequest = {
  companyId: string;
  projectId: string;
  kind: CatalogueKind;
  name: string;
  unit: string;
  categoryId: string;
  // Only labour has a type; null for materials and overheads
  labourType: string | null;
};
 
export type CreateCategoryRequest = {
  companyId: string;
  projectId: string;
  name: string;
};
 
// One thing a recipe is made of and how much of it 1 unit of the recipe needs
export type RecipeComponentRequest = {
  itemId: string;
  quantity: number;
};
 
export type CreateRecipeRequest = {
  companyId: string;
  projectId: string;
  name: string;
  categoryId: string;
  // What the recipe is priced per, for example m² for a wall
  unit: string;
  description: string | null;
  materials: RecipeComponentRequest[];
  labour: RecipeComponentRequest[];
  overheads: RecipeComponentRequest[];
};
 
 