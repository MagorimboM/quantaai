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