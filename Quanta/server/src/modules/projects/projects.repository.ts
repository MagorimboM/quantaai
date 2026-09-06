import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

@Injectable()
export class ProjectsRepository {
  async getListOfProjects(request: { companyId: string }) {
    const response = await prisma.project.findMany({
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
      where: { companyId: request.companyId },
    });

    return response;
  }
}
