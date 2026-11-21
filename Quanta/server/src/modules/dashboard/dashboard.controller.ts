import { Controller, Get, Param } from '@nestjs/common';
import type {
  RecentProjectsResponse,
  RecentActivityResponse,
  KPIInformationResponse,
} from '@/modules/dashboard/contracts/dashboard.response.contract';
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { AccessService } from '@/auth/services/access.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';

// Every route runs behind the global ClerkAuthGuard, so @ClerkUserId() is the
// verified caller, and every route checks the company in the URL is really
// theirs before reading anything.
//
// There is no Zod schema here: these routes take no body or query, and the
// only input, companyId, is part of the route itself.
@Controller(':companyId/dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly accessService: AccessService,
  ) {}

  // The company's own details (name, address, contact...). Checked here because
  // the service reads the company by id alone.
  @Get('companyInformation')
  async getCompanyInformation(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ) {
    await this.accessService.requireCompanyAccess(clerkId, companyId);
    return await this.dashboardService.getCompanyInformation(companyId);
  }

  // The four headline numbers
  @Get('kpi')
  async getKPIInformation(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<KPIInformationResponse> {
    return this.dashboardService.getKPIInformation({ clerkId, companyId });
  }

  // The projects worked on most recently that aren't complete
  @Get('recent-projects')
  async getRecentProjects(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<RecentProjectsResponse> {
    return this.dashboardService.getRecentProjects({ clerkId, companyId });
  }

  // The latest audit log entries
  @Get('recent-activity')
  async getRecentActivity(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
  ): Promise<RecentActivityResponse> {
    return this.dashboardService.getRecentActivity({ clerkId, companyId });
  }
}