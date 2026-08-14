import { Injectable } from '@nestjs/common';
import { SettingsRepository } from '@/modules/settings/settings.repository';
type Address = {
  state: string;
  city: string;
  postCode: string;
  street: string;
  houseNumber: number | null;
};

type CompanyInformation = {
  companyId: string;
  companyName: string;
  companyAddress: Address;
};

type TeamMember = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};

type Documents = {
  documentId: string;
  documentName: string;
  documentType: string;
};

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getCompanyInformation(request: { companyId: string }) {
    return await this.settingsRepository.getCompanyInformation(request);
  }

  async getCompanyTeam(request: { companyId: string }) {
    return await this.getCompanyTeam(request);
  }

  async getCompanyComplianceAndStandardDocuments(request: {
    companyId: string;
  }) {
    return await this.getCompanyComplianceAndStandardDocuments(request);
  }

  async updateCompanyProfile(request: CompanyInformation) {
    return await this.updateCompanyProfile(request);
  }

  async updateCompanyTeam(request: TeamMember) {
    return await this.updateCompanyTeam(request);
  }

  async deleteCompanyTeamMember(request: TeamMember) {
    return await this.deleteCompanyTeamMember(request);
  }
}
