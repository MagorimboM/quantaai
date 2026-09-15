import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

@Injectable()
export class WorkspaceRepository {
  async getWorkspaces(request: { userId: string }) {
    // TODO :: implement last activity

    const response = await prisma.$transaction(async (tx) => {
      const response = await tx.$queryRaw`
    SELECT
      w.id,
      w.name,
      (SELECT COUNT(*)::int FROM projects p WHERE p."workspaceId" = w.id) AS "numberOfProjects",
      (SELECT COUNT(*)::int FROM recipes r WHERE r."workspaceId" = w.id) AS "numberOfRecipes"
    FROM workspaces w
    WHERE w."userId" = ${request.userId}
  `;
      return response;
    });

    return response;
  }

  async getPersonalWorkspace(request: { userId: string }) {
    const response: any[] = await prisma.$queryRaw`SELECT

    w.id AS id,
    w.name AS name,
    (SELECT COUNT(*)::int FROM projects p WHERE p."workspaceId" = w.id) AS "numberOfProjects",
    (SELECT COUNT(*)::int FROM recipes r WHERE r."workspaceId" = w.id) AS "numberOfRecipes"
    FROM workspaces w
    LEFT JOIN companies c ON c.id = w."companyId"
    WHERE w."userId" = ${request.userId}
    AND c.id IS NULL
    LIMIT 1
      `;
    return response[0];
  }

  async createNewWorkspace(request: any) {
    // take in the new company workspace details
  }
}
