// What the repository needs: the company whose numbers to read. The caller has
// already been checked to own it (see AccessService).
export type DashboardRequest = {
  companyId: string;
};