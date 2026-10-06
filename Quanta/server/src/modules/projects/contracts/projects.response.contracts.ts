// One project in the list. Only what a project card shows; client and site
// contact details are deliberately left out.
export type ProjectSummary = {
  id: string;
  companyId: string | null;
  name: string;
  type: string;
  status: string;
  updatedAt: Date;
  // how many takeoff lines the project has
  numberOfLineItems: number;
};

export type GetListOfProjectsResponse = {
  totalCount: number;
  page: number;
  limit: number;
  projects: ProjectSummary[];
};