export type KPIInformationResponse = {
  activeProjects: number;
  numberOfUploadedDocuments: number;
  totalRecipes: number;
  standardsLoaded: number;
  completionRate: number;
  projectsStartedThisMonth: number;
};

export type DashboardProject = {
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


export type RecentProjectsResponse = DashboardProject[];

export type RecentActivityResponse = DashboardProject[];