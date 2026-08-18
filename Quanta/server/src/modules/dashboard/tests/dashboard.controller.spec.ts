import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, afterAll, it, expect, describe } from '@jest/globals';
import { DashboardController } from '@/modules/dashboard/dashboard.controller';
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { DashboardRepository } from '@/modules/dashboard/dashboard.repository';

describe('Dashboard (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [DashboardService, DashboardRepository],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /:companyId/dashboard/kpi should return kpi information', async () => {
    const response = await request(app.getHttpServer())
      .get('/seed-company-001/dashboard/kpi')
      .expect(200);

    expect(response.body).toEqual({
      activeProjects: 1,
      numberOfUploadedDocuments: 0,
      totalRecipes: 2,
      standardsLoaded: 6,
      completionRate: 1,
      projectsStartedThisMonth: 2,
    });
  });

  it('GET /:companyId/dashboard/recent-projects should return incomplete projects only', async () => {
    const response = await request(app.getHttpServer())
      .get('/seed-company-001/dashboard/recent-projects')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('seed-proj-001');
  });

  it('GET /:companyId/dashboard/recent-activity should return all projects', async () => {
    const response = await request(app.getHttpServer())
      .get('/seed-company-001/dashboard/recent-activity')
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});