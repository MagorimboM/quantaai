import { prisma } from '@/core/database/postgres';
import { Injectable } from '@nestjs/common';
import type { DashboardRequest } from '@/modules/dashboard/contracts/dashboard.request.contracts';
import type {
  RecentProjectsResponse,
  RecentActivityResponse,
  KPIInformationResponse,
} from '@/modules/dashboard/contracts/dashboard.response.contract';

// Every method here assumes the caller was already checked to own the company.
@Injectable()
export class DashboardRepository {
  async getKPIInformation(
    request: DashboardRequest,
  ): Promise<KPIInformationResponse> {
    const { companyId } = request;

    // These reads don't depend on each other, so they run together
    const [
      activeProjects,
      completedProjects,
      totalRecipes,
      numberOfUploadedDocuments,
      firstProject,
    ] = await Promise.all([
      prisma.project.count({ where: { companyId, completed: false } }),
      prisma.project.count({ where: { companyId, completed: true } }),
      prisma.recipe.count({ where: { companyId, isArchived: false } }),
      prisma.document.count({ where: { companyId } }),
      prisma.$queryRaw<{ earliestDate: Date | null }[]>`
        SELECT MIN(p."createdAt") AS "earliestDate"
        FROM projects p
        WHERE p."companyId" = ${companyId}
      `,
    ]);

    // Completion rate = completed projects per year, counted from the year of
    // the company's first project. At least one year, so a company that
    // started a few weeks ago isn't shown an inflated rate.
    let completionRate = 0;
    const earliestYear = firstProject[0]?.earliestDate?.getFullYear();
    if (earliestYear !== undefined) {
      const yearsActive = Math.max(new Date().getFullYear() - earliestYear, 1);
      completionRate = completedProjects / yearsActive;
    }

    return {
      activeProjects,
      totalRecipes,
      numberOfUploadedDocuments,
      completionRate,
    };
  }

  // The ten projects worked on most recently that aren't complete yet.
  // Only the fields a card shows are read.
  async getRecentProjects(
    request: DashboardRequest,
  ): Promise<RecentProjectsResponse> {
    return await prisma.project.findMany({
      where: { companyId: request.companyId, completed: false },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        companyId: true,
        name: true,
        type: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  // The ten latest audit log entries, each with the name of the person who made
  // the change. The names for all entries are looked up in one query.
  async getRecentActivity(
    request: DashboardRequest,
  ): Promise<RecentActivityResponse> {
    const auditLogs = await prisma.auditLog.findMany({
      where: { companyId: request.companyId },
      orderBy: { changedAt: 'desc' },
      take: 10,
    });

    const distinctUserIds = [
      ...new Set(
        auditLogs
          .map((log) => log.userId)
          .filter((id): id is string => id !== null),
      ),
    ];

    const users = await prisma.user.findMany({
      where: { id: { in: distinctUserIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const userNameById = new Map(
      users.map((user) => [user.id, `${user.firstName} ${user.lastName}`]),
    );

    return auditLogs.map((log) => ({
      id: log.id,
      // An entry with no user was made by the system itself, not a person
      userName: log.userId
        ? (userNameById.get(log.userId) ?? 'Unknown user')
        : 'System',
      entityType: log.entityType,
      action: log.action,
      reason: log.reason,
      changedAt: log.changedAt,
    }));
  }
}