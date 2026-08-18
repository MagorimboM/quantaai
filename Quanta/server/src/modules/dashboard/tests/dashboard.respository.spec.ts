// ============================================================
// * DASHBOARD REPOSITORY — TEST SUITE *
// ============================================================
//
// Purpose:
//   Tests the DashboardRepository methods responsible for
//   gathering data shown on the application's dashboard.
//
// Covers:
//   - Get Company KPI       → key stats (active projects, recipes,
//                              documents, standards, completion rate)
//   - Get Recent Projects   → active (incomplete) projects list
//   - Get Recent Activity   → most recently updated projects,
//                              regardless of completion status
//
// Test data:
//   Uses seeded companies/projects from seed.sql (e.g. seed-company-001).
//   See /prisma/seed.sql for full fixture data.
//
//!Note:
//!   createdAt/updatedAt are set via NOW() in the seed script, so they
//!   change on every reseed — always assert these with expect.any(Date)
//!   rather than hardcoded values.
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardRepository } from '@/modules/dashboard/dashboard.repository';
import { beforeEach, it, expect, describe } from '@jest/globals';

describe('Dashboard Repository', () => {
  let dashboardRepository: DashboardRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardRepository],
    }).compile();

    dashboardRepository = module.get<DashboardRepository>(DashboardRepository);
  });

  //  Get company KPI
  // TODO :: remember to adjust the dates whenever your recreate database or run seed file again
  describe('Get Company KPI ', async () => {
    it('should return kpi information', async () => {
      const kpi = await dashboardRepository.getKPIInformation({
        companyId: 'seed-company-001',
      });

      expect(kpi).toEqual({
        activeProjects: 1,
        numberOfUploadedDocuments: 0,
        totalRecipes: 2,
        standardsLoaded: 6,
        completionRate: 1,
        projectsStartedThisMonth: 2,
      });
    });
  });

  // *  Get Recent projects *
  // TODO! :: remember to adjust the dates whenever your recreate database or run seed file again

  describe('Get Recent Projects', async () => {
    it('should return array of active projects', async () => {
      const recentProjects = await dashboardRepository.getRecentProjects({
        companyId: 'seed-company-001',
      });

      expect(recentProjects).toEqual([
        {
          id: 'seed-proj-001',
          userId: 'seed-user-001',
          companyId: 'seed-company-001',
          projectNumber: 'ABC-2026-001',
          name: 'Smith Residence',
          description: 'Single storey residential dwelling',
          type: 'single_storey',
          status: 'in_progress',
          stage: 'superstructure',
          clientName: 'Mr & Mrs Smith',
          clientEmail: 'smith@email.com.au',
          clientPhone: '0412 111 222',
          siteContactName: 'Bob Smith',
          siteContactPhone: '0412 333 444',
          address: '45 Riverside Drive',
          city: 'Subiaco',
          state: 'WA',
          postcode: '6008',
          drawingNumber: null,
          revision: null,
          startDate: new Date('2026-01-15T00:00:00.000Z'),
          endDate: new Date('2026-08-30T00:00:00.000Z'),
          completed: false,
          completedAt: null,
          createdAt: new Date('2026-08-18T02:39:51.174Z'),
          updatedAt: new Date('2026-08-18T02:39:51.174Z'),
        },
      ]);
    });
  });

  // * Get Recent Activity *
  // TODO! :: remember to adjust the dates whenever your recreate database or run seed file again

  describe('Get Recent Activity', async () => {
    it('should return a list of project with recent updates', async () => {
      const projects = await dashboardRepository.getRecentActivity({
        companyId: 'seed-company-001',
      });

      expect(projects).toEqual([
        {
          id: 'seed-proj-001',
          userId: 'seed-user-001',
          companyId: 'seed-company-001',
          projectNumber: 'ABC-2026-001',
          name: 'Smith Residence',
          description: 'Single storey residential dwelling',
          type: 'single_storey',
          status: 'in_progress',
          stage: 'superstructure',
          clientName: 'Mr & Mrs Smith',
          clientEmail: 'smith@email.com.au',
          clientPhone: '0412 111 222',
          siteContactName: 'Bob Smith',
          siteContactPhone: '0412 333 444',
          address: '45 Riverside Drive',
          city: 'Subiaco',
          state: 'WA',
          postcode: '6008',
          drawingNumber: null,
          revision: null,
          startDate: new Date('2026-01-15T00:00:00.000Z'),
          endDate: new Date('2026-08-30T00:00:00.000Z'),
          completed: false,
          completedAt: null,
          createdAt: new Date('2026-08-18T02:39:51.174Z'),
          updatedAt: new Date('2026-08-18T02:39:51.174Z'),
        },
        {
          id: 'seed-proj-002',
          userId: 'seed-user-001',
          companyId: 'seed-company-001',
          projectNumber: 'ABC-2025-014',
          name: 'Turner Extension',
          description: 'Rear extension and renovation',
          type: 'renovation',
          status: 'completed',
          stage: 'closed',
          clientName: 'Mrs Turner',
          clientEmail: 'turner@email.com.au',
          clientPhone: '0412 555 111',
          siteContactName: 'Bob Smith',
          siteContactPhone: '0412 333 444',
          address: '7 Hawthorn Street',
          city: 'Nedlands',
          state: 'WA',
          postcode: '6009',
          drawingNumber: null,
          revision: null,
          startDate: new Date('2025-05-01T00:00:00.000Z'),
          endDate: new Date('2025-10-12T00:00:00.000Z'),
          completed: true,
          completedAt: new Date('2025-10-12T15:30:00.000Z'),
          createdAt: new Date('2026-08-18T02:39:51.174Z'),
          updatedAt: new Date('2026-08-18T02:39:51.174Z'),
        },
      ]);
    });
  });
});
