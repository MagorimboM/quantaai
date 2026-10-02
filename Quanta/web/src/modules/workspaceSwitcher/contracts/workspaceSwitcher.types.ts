export type CompanyWorkspace = {
  id: string;
  companyId: string;
  name: string;
  numberOfProjects: number;
  numberOfRecipes: number;
  lastActivity: string;
  isArchived: boolean;
};

export type PersonalWorkspace = {
  id: string;
  name: string;
  numberOfProjects: number;
  numberOfRecipes: number;
  lastActivity: string;
};

// TODO :: [backend] this shape assumes the new cross-company endpoint
// (GET /projects/all) returns these fields per project, including which
// company it belongs to -- see api.ts's getAllProjects for the endpoint
// this calls, which does not exist on the backend yet.
export type ProjectSummary = {
  id: string;
  companyId: string;
  name: string;
  companyName: string;
  dueDate?: string;
  updatedAt?: string;
};