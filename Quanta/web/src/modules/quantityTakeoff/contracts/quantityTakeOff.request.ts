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