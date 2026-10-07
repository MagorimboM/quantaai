// A company workspace as the switcher lists it. `name` is the company's name, so
// renaming the company in Settings renames it here too.
export type CompanyWorkspace = {
  id: string;
  name: string;
  companyId: string;
  isArchived: boolean;
  numberOfProjects: number;
  // live recipes only; archived ones aren't counted
  numberOfRecipes: number;
};

// The person's own workspace, for work that belongs to no company
export type PersonalWorkspace = {
  id: string;
  name: string;
  numberOfProjects: number;
  numberOfRecipes: number;
};

// An unfinished project with a due date, from any of the person's companies.
// Dates arrive as ISO strings over JSON.
export type DueProject = {
  id: string;
  companyId: string;
  name: string;
  companyName: string;
  dueDate: Date;
  updatedAt: Date;
};