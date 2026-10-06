import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type { GetListOfProjectsRequest } from '@/modules/projects/contracts/projects.request.contracts';
import type { GetListOfProjectsResponse } from '@/modules/projects/contracts/projects.response.contracts';

// OWNERSHIP MODEL: userId owns all data; companyId is a tag on it. Projects are
// read by both, so a company's projects only ever include the caller's own.
@Injectable()
export class ProjectsRepository {
  // One page of projects, most recently updated first (so the work the user
  // touched last is on top). Completed projects are included: this is the full
  // list, unlike the dashboard, which shows only unfinished ones.
  async getListOfProjects(
    request: GetListOfProjectsRequest,
  ): Promise<GetListOfProjectsResponse> {
    // A search term matches the project's name or description, ignoring case
    const where = {
      companyId: request.companyId,
      userId: request.userId,
      ...(request.term
        ? {
            OR: [
              { name: { contains: request.term, mode: 'insensitive' as const } },
              {
                description: {
                  contains: request.term,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [rows, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          companyId: true,
          name: true,
          type: true,
          status: true,
          updatedAt: true,
          // Only the number of takeoff lines is needed, not the lines themselves
          _count: { select: { takeoffItems: true } },
        },
        skip: (request.page - 1) * request.limit,
        take: request.limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      totalCount,
      page: request.page,
      limit: request.limit,
      projects: rows.map(({ _count, ...project }) => ({
        ...project,
        numberOfLineItems: _count.takeoffItems,
      })),
    };
  }
}