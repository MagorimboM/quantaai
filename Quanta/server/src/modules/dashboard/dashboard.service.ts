import { Injectable } from '@nestjs/common';
import { DashboardRepository } from '@/modules/dashboard/dashboard.repository';
import type {
  GetKPIInformationRequest,
  GetRecentProjectsRequest,
  GetRecentActivityRequest,
} from '@/modules/dashboard/contracts/dashboard.request.contracts';
import type {
  RecentProjectsResponse,
  RecentActivityResponse,
  KPIInformationResponse,
} from '@/modules/dashboard/contracts/dashboard.response.contract';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getKPIInformation(
    request: GetKPIInformationRequest,
  ): Promise<KPIInformationResponse> {
    return this.dashboardRepository.getKPIInformation(request);
  }

  async getRecentProjects(
    request: GetRecentProjectsRequest,
  ): Promise<RecentProjectsResponse> {
    return this.dashboardRepository.getRecentProjects(request);
  }

  async getRecentActivity(
    request: GetRecentActivityRequest,
  ): Promise<RecentActivityResponse> {
    return this.dashboardRepository.getRecentActivity(request);
  }
}