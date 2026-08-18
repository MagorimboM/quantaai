import { prisma } from '@/core/database/postgres';
import { Injectable } from '@nestjs/common';
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
export class DashboardRepository {
  async getKPIInformation(
    request: GetKPIInformationRequest,
  ): Promise<KPIInformationResponse> {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const startOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );

    const kpi = await prisma.$transaction(async (tx) => {
      const projects = await tx.project.count({
        where: {
          companyId: request.companyId,
          completed: false,
        },
      });

      const projectsStartedThisMonth = await tx.project.count({
        where: {
          companyId: request.companyId,
          createdAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
      });
      const numberOfRecipes = await tx.recipe.count({
        where: { companyId: request.companyId },
      });
      const numberOfUploadedDocuments = await tx.document.count({
        where: { companyId: request.companyId },
      });
      const numberOfCompletedProjects = await tx.project.count({
        where: { companyId: request.companyId, completed: true },
      });
      const numberOfStandards = await tx.australianTradeCode.count();

      const earliestDates = await tx.$queryRaw<{ earliestDate: Date | null }[]>`
      SELECT MIN(p."createdAt") AS "earliestDate"
      FROM projects p
      WHERE p."companyId" = ${request.companyId}
    `;

      const earliestYear = earliestDates[0].earliestDate?.getFullYear();
      const currentYear = new Date().getFullYear();
      let completionRate = 0;

      if (earliestYear != undefined) {
        const yearSpan = Math.max(currentYear - earliestYear, 1);
        completionRate = numberOfCompletedProjects / yearSpan;
      }

      return {
        activeProjects: projects,
        numberOfUploadedDocuments,
        totalRecipes: numberOfRecipes,
        standardsLoaded: numberOfStandards,
        completionRate: completionRate,
        projectsStartedThisMonth: projectsStartedThisMonth,
      };
    });

    return kpi;
  }

  async getRecentProjects(
    request: GetRecentProjectsRequest,
  ): Promise<RecentProjectsResponse> {
    // get recent worked on or saved projects

    const projects = await prisma.project.findMany({
      where: { companyId: request.companyId, completed: false },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 4,
    });

    return projects;
  }

  async getRecentActivity(
    request: GetRecentActivityRequest,
  ): Promise<RecentActivityResponse> {
    // get recent activity

    const projects = await prisma.project.findMany({
      where: { companyId: request.companyId },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    });
    return projects;
  }
}