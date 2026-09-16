import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { NotAcceptableException } from '@nestjs/common';

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

  async createNewWorkspace(request: {
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
  }) {
    const userId = '';

    // check if company with similar details exist?
    // if exist throw error
    // if not create company and workspace under that user id
    // return the workspace details

    const existingCompany: any[] = await prisma.$queryRaw`
      SELECT c.name, c.id 
      FROM companies c 
      WHERE c."userId" = ${`seed-user-001`} 
      AND c.name = ${request.name} 
      LIMIT 1`;

    if (existingCompany.length > 0) {
      throw new NotAcceptableException('company already exists');
    }

    const response = await prisma.$transaction(async (tx) => {
      // create new company

      const newCompany: any = await tx.$queryRaw`
      INSERT INTO companies 
      (id,"userId", name, address, state, postcode, country, phone, email, "contactName", "contactPhone", "contactEmail", "companyType", "updatedAt")
      VALUES (gen_random_uuid(), ${'seed-user-001'}, ${request.name}, ${request.address}, ${request.state}, ${request.postcode}, ${request.country}, ${request.phone}, ${request.email}, ${request.contactName}, ${request.contactPhone}, ${request.contactEmail}, ${request.companyType}, ${'NOW()'}) RETURNING id`;
      const newWorkspace: any = await tx.$queryRaw`
  INSERT INTO workspaces 
  (id, "userId", "companyId", name,"updatedAt")
  VALUES (gen_random_uuid(), ${'seed-user-001'}, ${newCompany[0].id}, ${request.name}, ${'NOW()'})
  RETURNING id
`;
      const response = await tx.$queryRaw`
      SELECT w.id, c.name, 
      (SELECT COUNT(*)::int FROM projects p where p."companyId" = c.id AND p."userId" = ${'seed-user-001'}) AS numberOfProjects, 
      (SELECT COUNT(*)::int FROM recipes r WHERE r."companyId" = c.id AND r."userId" = ${'seed-user-001'}) AS numberOfRecipes
      FROM 
      workspaces w
      LEFT JOIN companies c 
      ON  c.id = w."companyId"
      WHERE w."userId" = ${'seed-user-001'}
      AND w.id = ${newWorkspace[0].id}`;

      return response;
    });

    return response;
  }
}
