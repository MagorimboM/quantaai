export type Recipe = {
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
} | null 

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

export type LineItem = {
  id: string;
  userId: string | null;
  companyId: string | null;
  projectId: string;
  recipeId: string | null;
  description: string;
  measurement: number;
  unit: string;
  notes: string | null;
};

export type UpdateLineItemRequest = {
  companyId: string;
  projectId: string;
  body: LineItem[];
};

export type UpdateProjectStatusRequest = {
  companyId: string;
  projectId: string;
  completed: boolean;
};

type LineItems = {
  id: string;
};

export type DeleteProjectLineItemsRequest = {
  companyId: string;
  projectId: string;
  lineItems: LineItems[];
};

export type DeleteProjectBillOfQuantsRequest = {
  companyId: string;
  projectId: string;
};

export type DeleteProjectRequest = {
  companyId: string;
  projectId: string;
};
