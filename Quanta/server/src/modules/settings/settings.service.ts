import { Injectable } from '@nestjs/common';
import { SettingsRepository } from '@/modules/settings/settings.repository';
import type {CompanyInformationRequest, TeamMemberRequest} from "@/modules/settings/contracts/settings.requests.contracts"


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

  async updateCompanyProfile(request: CompanyInformationRequest) {
    return await this.updateCompanyProfile(request);
  }

  async updateCompanyTeam(request: TeamMemberRequest) {
    return await this.updateCompanyTeam(request);
  }

  async deleteCompanyTeamMember(request: TeamMemberRequest) {
    return await this.deleteCompanyTeamMember(request);
  }
}
