import { Controller, Get, Param } from '@nestjs/common';
import type {
  RecentProjectsResponse,
  RecentActivityResponse,
  KPIInformationResponse,
} from '@/modules/dashboard/contracts/dashboard.response.contract'
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';

// Every route runs behind the global ClerkAuthGuard, so @ClerkUserId() is the
// verified caller. The service checks the company in the URL is really theirs.
@Controller(':companyId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

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