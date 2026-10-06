// Every dashboard call is scoped to one company. The backend works out the
// user from their Clerk token, so only the company goes in the URL.
export type GetDashboardRequest = {
  companyId: string;
};