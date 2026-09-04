export type GetBillOfQuantsResponse = {
  id: string;
  description: string;
  measurement: number;
  unit: string;
  notes: string | null;
  recipe: {
    id: string;
    name: string;
    unit: string;
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
  } | null;
};

export type UpdateLineItemResponse = {
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

export type UpdateProjectStatusResponse = {
  id: string;
  userId: string | null;
  companyId: string | null;
  projectNumber: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  stage: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  siteContactName: string | null;
  siteContactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  drawingNumber: string | null;
  revision: string | null;
  startDate: Date | null;
  endDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DeletedLineItemsResponse = {
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
} []

export type DeleteProjectBillOfQuantitiesResponse = {
  success: boolean;
  deletedItems: number;
};

export type DeleteProjectResponse = {
  id: string;
  userId: string | null;
  companyId: string | null;
  projectNumber: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  stage: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  siteContactName: string | null;
  siteContactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  drawingNumber: string | null;
  revision: string | null;
  startDate: Date | null;
  endDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
