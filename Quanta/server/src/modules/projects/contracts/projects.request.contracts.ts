// What the repository needs. The caller has already been checked to own the
// company (see AccessService), and page/limit have been kept in a safe range.
export type GetListOfProjectsRequest = {
  companyId: string;
  userId: string;
  term?: string;
  page: number;
  limit: number;
};

export type CreateNewProjectRequest = {
  projectNumber: string;
  projectName: string;
  projectDescription: string;
  projectContactName: string;
  projectPhoneNumber: string;
  projectAddress: string;
  projectCity: string;
  projectPostCode: number | null;
  projectState:string; 
  projectCountry:string; 
  projectType: string;
  projectContact: number | null;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
};
