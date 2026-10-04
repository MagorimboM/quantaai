import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { NotAcceptableException } from '@nestjs/common';

@Injectable()
export class WorkspaceRepository {
  async getWorkspaces(request: { userId: string }) {
    const response = await prisma.$transaction(async (tx) => {
      const response = await tx.$queryRaw`
    SELECT
      w.id,
      w.name,
      w."companyId",
      w."isArchived",
      (SELECT COUNT(*)::int FROM projects p WHERE p."companyId" = w."companyId") AS "numberOfProjects",
      (SELECT COUNT(*)::int FROM recipes r WHERE r."companyId" = w."companyId") AS "numberOfRecipes"
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
    (SELECT COUNT(*)::int FROM projects p WHERE p."userId" = ${request.userId} AND p."companyId" IS NULL) AS "numberOfProjects",
    (SELECT COUNT(*)::int FROM recipes r WHERE r."userId" = ${request.userId} AND r."companyId" IS NULL) AS "numberOfRecipes"
    FROM workspaces w
    LEFT JOIN companies c ON c.id = w."companyId"
    WHERE w."userId" = ${request.userId}
    AND c.id IS NULL
    LIMIT 1
      `;
    return response[0];
  }

  async createNewWorkspace(
    request: {
      name: string;
      address: string;
      city: string;
      state: string;
      postcode: string;
      country: 'Australia';
      phone: string;
      email: string;
      contactName: string;
      contactPhone: string;
      contactEmail: string;
      companyType: string;
    },
    clerkId:string,
  ) {
    const userId : any =
      await prisma.$queryRaw`SELECT u.id FROM users u where  u."clerkId" = ${clerkId} limit 1`;

    const existingCompany: any[] = await prisma.$queryRaw`
      SELECT c.name, c.id 
      FROM companies c 
      WHERE c."userId" = ${userId[0].id} 
      AND c.name = ${request.name} 
      LIMIT 1`;

    if (existingCompany.length > 0) {
      throw new NotAcceptableException('company already exists');
    }

    const response: any = await prisma.$transaction(async (tx) => {
      const newCompany: any = await tx.$queryRaw`
      INSERT INTO companies 
      (id, "userId", name, address, city, state, postcode, country, phone, email, "contactName", "contactPhone", "contactEmail", "companyType", "updatedAt")
      VALUES (gen_random_uuid(), ${userId[0].id}, ${request.name}, ${request.address}, ${request.city}, ${request.state}, ${request.postcode}, ${request.country}, ${request.phone}, ${request.email}, ${request.contactName}, ${request.contactPhone}, ${request.contactEmail}, ${request.companyType}, NOW()) RETURNING id`;
      const newWorkspace: any = await tx.$queryRaw`
      INSERT INTO workspaces 
      (id, "userId", "companyId", name, "updatedAt")
      VALUES (gen_random_uuid(), ${userId[0].id}, ${newCompany[0].id}, ${request.name}, NOW())
      RETURNING id`;
      const response = await tx.$queryRaw`
      SELECT w.id, w."companyId", w."isArchived", c.name, 
      (SELECT COUNT(*)::int FROM projects p where p."companyId" = c.id AND p."userId" = ${userId[0].id}) AS "numberOfProjects", 
      (SELECT COUNT(*)::int FROM recipes r WHERE r."companyId" = c.id AND r."userId" = ${userId[0].id}) AS "numberOfRecipes"
      FROM 
      workspaces w
      LEFT JOIN companies c 
      ON  c.id = w."companyId"
      WHERE w."userId" = ${userId[0].id}
      AND w.id = ${newWorkspace[0].id}`;

      return response;
    });

    return response[0];
  }

  async getWorkspaceProjects(clerkId: string) {
    const response = await prisma.$queryRaw`
      SELECT 
      p.id AS "id",
      p."companyId" AS "companyId",
      p.name AS "name",
      c.name AS "companyName",
      p."endDate" AS "dueDate",
      p."updatedAt" AS "updatedAt"
      FROM companies c 
      JOIN projects p ON c.id = p."companyId" 
      JOIN users u ON u.id = p."userId"
      WHERE u."clerkId" = ${clerkId}
      AND p."endDate" >= NOW()
      ORDER BY p."endDate" ASC
      `;

    return response;
  }
}
