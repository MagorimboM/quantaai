
export type Address = {
  state: string;
  city: string;
  postCode: string;
  street: string;
  houseNumber: number | null;
};

export type GetCompanyInformationRequest = {
   companyId: string 
}

export type GetCompanyTeamRequest = {
   companyId: string 
}

export type CompanyInformationRequest = {
  companyId: string;
  companyName: string;
  companyAddress: Address;
};

export type TeamMemberRequest = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};

export type Documents = {
  documentId: string;
  documentName: string;
  documentType: string;
};