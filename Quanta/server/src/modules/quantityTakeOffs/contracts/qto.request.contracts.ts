// Which project's takeoff a repository call is about. By the time a repository
// method runs, the caller has been checked to own both (see AccessService).
export type BillOfQuantsScope = {
  companyId: string;
  projectId: string;
};

// The three fields a user can edit on a line item. The location is stored in
// `description`. Everything else on the line (recipe, unit) is fixed once created.
export type LineItemInput = {
  id: string;
  description: string;
  measurement: number;
  notes: string | null;
};

export type UpdateProjectLineItemsRequest = BillOfQuantsScope & {
  lineItems: LineItemInput[];
};

// completed = true marks the takeoff finished; false reopens it
export type UpdateProjectStatusRequest = BillOfQuantsScope & {
  completed: boolean;
};

export type DeleteProjectLineItemsRequest = BillOfQuantsScope & {
  lineItemIds: string[];
};

// The recipes a company can put on a takeoff
export type GetRecipeOptionsRequest = {
  companyId: string;
};

// What the browser sends to add a line: the recipe, the one measurement it is
// multiplied by, and where it is (stored in `description`).
export type AddLineItemInput = {
  recipeId: string;
  measurement: number;
  description: string;
  notes: string | null;
};

// The same, once the caller is known. `userId` comes from the Clerk token and
// is never sent by the browser.
export type AddLineItemRequest = BillOfQuantsScope &
  AddLineItemInput & {
    userId: string;
  };