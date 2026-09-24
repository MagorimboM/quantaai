import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

@Injectable()
export class ProjectsRepository {
  async getListOfProjects(request: {
    companyId: string;
    userId: string;
    term?: string;
    page: number;
    limit: number;
  }) {
    const where = {
      companyId: request.companyId,
      userId: request.userId,
      ...(request.term
        ? {
            OR: [
              { name: { contains: request.term, mode: 'insensitive' as const } },
              { description: { contains: request.term, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        select: {
          id: true,
          companyId: true,
          name: true,
          description: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          takeoffItems: {
            select: {
              id: true,
              description: true,
              projectId: true,
            },
          },
        },
        where,
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
      projects,
    };
  }
}