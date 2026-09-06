import { Controller, Get, Param } from '@nestjs/common';
import type {
  RecentProjectsResponse,
  RecentActivityResponse,
  KPIInformationResponse,
} from '@/modules/dashboard/contracts/dashboard.response.contract';
import { DashboardService } from '@/modules/dashboard/dashboard.service';

@Controller(':companyId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  async getKPIInformation(
    @Param('companyId') companyId: string,
  ): Promise<KPIInformationResponse> {
    return this.dashboardService.getKPIInformation({ companyId });
  }

  @Get('/recent-projects')
  async getRecentProjects(
    @Param('companyId') companyId: string,
  ): Promise<RecentProjectsResponse> {
    return this.dashboardService.getRecentProjects({ companyId });
  }

  @Get('/recent-activity')
  async getRecentActivity(
    @Param('companyId') companyId: string,
  ): Promise<RecentActivityResponse> {
    return this.dashboardService.getRecentActivity({ companyId });
  }
}
