// What the repository needs. The caller has already been checked to own the
// company (see AccessService), and page/limit have been kept in a safe range.
export type GetListOfProjectsRequest = {
  companyId: string;
  userId: string;
  term?: string;
  page: number;
  limit: number;
};