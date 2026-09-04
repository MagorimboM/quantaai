export type LineItems = {
  id: string;
  userId: string | null;
  companyId: string | null;
  projectId: string;
  recipeId: string | null;
  description: string;
  measurement: number;
  unit: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GetProjectBillOfQuantsRequest = {
  companyId: string;
  projectId: string;
  query?: string;
  page?: number;
  limit?: number;
};

export type UpdateProjectLineItemsRequest = {
  companyId: string;
  projectId: string;
  lineItems: LineItems[];
};

export type UpdateProjectStatusRequest = {
  companyId: string;
  projectId: string;
  completed: boolean;
};

export type DeleteProjectLineItemsRequest = {
  companyId: string;
  projectId: string;
  lineItems: { id: string }[];
};

export type DeleteProjectBillOfQuantsRequest = {
  companyId: string;
  projectId: string;
};

export type DeleteProjectRequest = {
  companyId: string;
  projectId: string;
};