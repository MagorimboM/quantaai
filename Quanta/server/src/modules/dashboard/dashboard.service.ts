import { Injectable } from '@nestjs/common';
import { DashboardRepository } from '@/modules/dashboard/dashboard.repository';
import { AccessService } from '@/auth/services/access.service';
import type {
  RecentProjectsResponse,
  RecentActivityResponse,
  KPIInformationResponse,
} from '@/modules/dashboard/contracts/dashboard.response.contract'

// Each method first checks the company really belongs to the caller. The
// company id comes from the URL, so on its own it proves nothing.
@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly accessService: AccessService,
  ) {}

  async getKPIInformation(request: {
    clerkId: string;
    companyId: string;
  }): Promise<KPIInformationResponse> {
    await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return this.dashboardRepository.getKPIInformation({
      companyId: request.companyId,
    });
  }

  async getRecentProjects(request: {
    clerkId: string;
    companyId: string;
  }): Promise<RecentProjectsResponse> {
    await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return this.dashboardRepository.getRecentProjects({
      companyId: request.companyId,
    });
  }

  async getRecentActivity(request: {
    clerkId: string;
    companyId: string;
  }): Promise<RecentActivityResponse> {
    await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return this.dashboardRepository.getRecentActivity({
      companyId: request.companyId,
    });
  }
}