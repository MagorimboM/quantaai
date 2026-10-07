import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type { NewCompanyRecord } from '@/modules/workspace/contracts/workspace.request.contracts';
import type {
  CompanyWorkspace,
  PersonalWorkspace,
  DueProject,
} from '@/modules/workspace/contracts/workspace.response.contracts';

// The most projects the "due" list returns
const DUE_PROJECT_LIMIT = 50;

// A new company starts with the trade categories the product promises, so its
// recipes have somewhere to go from day one. They are ordinary categories: the
// owner can add more.
const DEFAULT_CATEGORIES = [
  { name: 'Masonry', description: 'Bricks, blocks and mortar' },
  { name: 'Concrete', description: 'Concrete and reinforcement' },
  { name: 'Roofing', description: 'Roofing materials and labour' },
  { name: 'Framing', description: 'Timber and steel framing' },
  { name: 'Earthworks', description: 'Excavation, fill and compaction' },
  { name: 'Finishes', description: 'Plaster, paint, tiling and fit-off' },
];

// A workspace sits above a company: a company can have workspaces, and a
// workspace with no company is the person's own. Everything is filtered by the
// owning user, so a person only ever sees their own.
@Injectable()
export class WorkspaceRepository {
  // The person's company workspaces, alphabetical. The name shown is the
  // company's, and the counts are the company's projects and live recipes.
  async getCompanyWorkspaces(userId: string): Promise<CompanyWorkspace[]> {
    return await prisma.$queryRaw<CompanyWorkspace[]>`
      SELECT
        w.id,
        c.name,
        w."companyId",
        (w."isArchived" OR c."isArchived") AS "isArchived",
        (SELECT COUNT(*)::int
           FROM projects p
          WHERE p."companyId" = c.id AND p."userId" = ${userId}) AS "numberOfProjects",
        (SELECT COUNT(*)::int
           FROM recipes r
          WHERE r."companyId" = c.id AND r."userId" = ${userId}
            AND r."isArchived" = false) AS "numberOfRecipes"
      FROM workspaces w
      JOIN companies c ON c.id = w."companyId"
      WHERE w."userId" = ${userId}
        AND c."userId" = ${userId}
      ORDER BY c.name ASC`;
  }

  // The person's own workspace (the one with no company), or null if they
  // don't have one. Its counts are the person's projects and recipes that
  // belong to no company.
  async getPersonalWorkspace(userId: string): Promise<PersonalWorkspace | null> {
    const rows = await prisma.$queryRaw<PersonalWorkspace[]>`
      SELECT
        w.id,
        w.name,
        (SELECT COUNT(*)::int
           FROM projects p
          WHERE p."userId" = ${userId} AND p."companyId" IS NULL) AS "numberOfProjects",
        (SELECT COUNT(*)::int
           FROM recipes r
          WHERE r."userId" = ${userId} AND r."companyId" IS NULL
            AND r."isArchived" = false) AS "numberOfRecipes"
      FROM workspaces w
      WHERE w."userId" = ${userId}
        AND w."companyId" IS NULL
      LIMIT 1`;
    return rows[0] ?? null;
  }

  // The person's unfinished projects that have a due date, across all their
  // companies, soonest first. Overdue ones come first on purpose: a late
  // project is the one that needs attention most.
  async getDueProjects(userId: string): Promise<DueProject[]> {
    return await prisma.$queryRaw<DueProject[]>`
      SELECT
        p.id,
        p."companyId",
        p.name,
        c.name AS "companyName",
        p."endDate" AS "dueDate",
        p."updatedAt"
      FROM projects p
      JOIN companies c ON c.id = p."companyId"
      WHERE p."userId" = ${userId}
        AND c."userId" = ${userId}
        AND c."isArchived" = false
        AND p.completed = false
        AND p."endDate" IS NOT NULL
      ORDER BY p."endDate" ASC
      LIMIT ${DUE_PROJECT_LIMIT}`;
  }

  // True if the person already has a company with this name (ignoring case)
  async companyNameTaken(userId: string, name: string): Promise<boolean> {
    const count = await prisma.company.count({
      where: { userId, name: { equals: name, mode: 'insensitive' } },
    });
    return count > 0;
  }

  // Creates the company, its default categories and its workspace together, or
  // none of them if anything fails. Returns the workspace as the switcher lists
  // it; a brand-new company has no projects or recipes yet.
  async createCompanyWorkspace(
    record: NewCompanyRecord,
  ): Promise<CompanyWorkspace> {
    return await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          userId: record.userId,
          name: record.name,
          address: record.address,
          city: record.city,
          state: record.state,
          postcode: record.postcode,
          country: record.country,
          phone: record.phone,
          email: record.email,
          contactName: record.contactName,
          contactPhone: record.contactPhone,
          contactEmail: record.contactEmail,
          companyType: record.companyType,
          categories: {
            create: DEFAULT_CATEGORIES.map((category) => ({
              userId: record.userId,
              name: category.name,
              description: category.description,
              isDefault: true,
            })),
          },
        },
        select: { id: true, name: true },
      });

      const workspace = await tx.workspace.create({
        data: {
          userId: record.userId,
          companyId: company.id,
          name: company.name,
        },
        select: { id: true },
      });

      return {
        id: workspace.id,
        name: company.name,
        companyId: company.id,
        isArchived: false,
        numberOfProjects: 0,
        numberOfRecipes: 0,
      };
    });
  }
}