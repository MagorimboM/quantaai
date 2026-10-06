// Headline numbers for one company. See metrics.tsx for what each one means.
export type KPIInformationResponse = {
  activeProjects: number;
  totalRecipes: number;
  numberOfUploadedDocuments: number;
  completionRate: number;
};

// Only what a project card needs. Dates arrive as ISO strings over JSON,
// not Date objects.
export type RecentProject = {
  id: string;
  companyId: string | null;
  name: string;
  type: string;
  status: string;
  updatedAt: string;
};

export type RecentProjectsResponse = RecentProject[];

export type RecentActivityItem = {
  id: string;
  userName: string;
  entityType: string;
  action: string;
  reason: string | null;
  changedAt: string;
};

export type RecentActivityResponse = RecentActivityItem[];