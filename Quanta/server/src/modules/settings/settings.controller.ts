import { Controller, Get, Put, Post, Delete, Body, Param } from '@nestjs/common';
import { SettingsService } from '@/modules/settings/settings.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import type {
  UpdateCompanyProfileRequest,
  AddTeamMemberRequest,
} from '@/modules/settings/contracts/settings.requests.contracts';
import type {
  CompanyProfileDetails,
  TeamMember,
  DeleteTeamMemberResponse,
  StandardDocument,
} from '@/modules/settings/contracts/settings.response.contracts';

// The company's settings. Every route runs behind the global ClerkAuthGuard, so
// @ClerkUserId() is the verified caller; the service checks the company in the
// URL is really theirs.
@Controller(':companyId/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // The company's details
  @Get('profile')
  async getCompanyProfile(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<CompanyProfileDetails> {
    return await this.settingsService.getCompanyProfile({ clerkId, companyId });
  }

  // Saves edited company details and returns the company as stored
  @Put('profile')
  async updateCompanyProfile(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body() body: UpdateCompanyProfileRequest,
  ): Promise<CompanyProfileDetails> {
    return await this.settingsService.updateCompanyProfile({
      clerkId,
      companyId,
      body,
    });
  }

  // The company's team
  @Get('team')
  async getCompanyTeam(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<TeamMember[]> {
    return await this.settingsService.getCompanyTeam({ clerkId, companyId });
  }

  // Adds a person to the team
  @Post('team')
  async addTeamMember(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body() body: AddTeamMemberRequest,
  ): Promise<TeamMember> {
    return await this.settingsService.addTeamMember({
      clerkId,
      companyId,
      body,
    });
  }

  // Removes a person from the team
  @Delete('team/:memberId')
  async deleteTeamMember(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('memberId') memberId: string,
  ): Promise<DeleteTeamMemberResponse> {
    return await this.settingsService.deleteTeamMember({
      clerkId,
      companyId,
      memberId,
    });
  }

  // The company's standards and compliance documents
  @Get('documents')
  async getStandardsDocuments(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<StandardDocument[]> {
    return await this.settingsService.getStandardsDocuments({
      clerkId,
      companyId,
    });
  }
}