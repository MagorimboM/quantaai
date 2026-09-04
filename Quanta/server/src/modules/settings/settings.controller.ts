import { Controller, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { SettingsService } from '@/modules/settings/settings.service';
import type {CompanyInformationRequest, TeamMemberRequest} from "@/modules/settings/contracts/settings.requests.contracts"


// TODO :: param the company id
// TODO :: create the end points.

@Controller(':companyId/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/companyProfile')
  async getCompanyInformation(@Param(':/companyId') companyId: string) {
    return await this.settingsService.getCompanyInformation({
      companyId: companyId,
    });
  }
  @Get('/companyTeam')
  async getCompanyTeam(@Param(':companyId') companyId: string) {
    return await this.settingsService.getCompanyTeam({ companyId: companyId });
  }
  @Get('/compliance-and-standard-documents')
  async getCompanyComplianceAndStandardDocuments(
    @Param(':companyId') companyId: string,
  ) {
    return await this.settingsService.getCompanyComplianceAndStandardDocuments({
      companyId: companyId,
    });
  }
  
  @Put('/companyProfile')
  async updateCompanyProfile(@Body() request: CompanyInformationRequest) {
    return await this.settingsService.updateCompanyProfile(request);
  }
  @Put('/companyTeamMember')
  async updateCompanyTeam(@Body() request: TeamMemberRequest) {
    return await this.settingsService.updateCompanyTeam(request);
  }

  @Delete('/companyTeamMember')
  async deleteCompanyTeamMember(@Body() request: TeamMemberRequest) {
    return await this.settingsService.deleteCompanyTeamMember(request);
  }
}
