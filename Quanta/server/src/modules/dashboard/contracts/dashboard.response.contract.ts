// Headline numbers for one company.
export type KPIInformationResponse = {
  // projects not yet marked complete (drafts included)
  activeProjects: number;
  // recipes in the library, archived ones excluded
  totalRecipes: number;
  // specs, drawings and policies uploaded for the company
  numberOfUploadedDocuments: number;
  // completed projects per year since the company's first project
  completionRate: number;
};

// Only what a project card shows. Client and site contact details are left
// out on purpose: the dashboard doesn't need them.
export type RecentProject = {
  id: string;
  companyId: string | null;
  name: string;
  type: string;
  status: string;
  updatedAt: Date;
};

export type RecentProjectsResponse = RecentProject[];

export type RecentActivityItem = {
  id: string;
  userName: string;
  entityType: string;
  action: string;
  reason: string | null;
  changedAt: Date;
};

export type RecentActivityResponse = RecentActivityItem[];