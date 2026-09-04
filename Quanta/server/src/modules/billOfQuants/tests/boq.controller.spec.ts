import { describe, it, beforeEach, afterAll, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BillOfQuantsController } from '@/modules/billOfQuants/boq.controller';
import { BillOfQuantsService } from '@/modules/billOfQuants/boq.service';
import { BillOfQuantsRepository } from '@/modules/billOfQuants/boq.repository';

describe('Bill Of Quantities (e2e)', () => {
  let app: INestApplication;

  const companyId = 'seed-company-001';
  const projectId = 'seed-proj-001';
  const baseUrl = `/${companyId}/projects/${projectId}`;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      controllers: [BillOfQuantsController],
      providers: [BillOfQuantsRepository, BillOfQuantsService],
    }).compile();

    app = testModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /:companyId/projects/:projectId/bill-of-quantities?query={term}&page={1}&limit={10}', async () => {
    const response = await request(app.getHttpServer())
      .get(`${baseUrl}/bill-of-quantities`)
      .query({ query: 'brick', page: 1, limit: 10 })
      .expect(200);

    // Numbers below are derived directly from the seed data:
    // recipe_materials/labour/overheads quantities × takeoff_items.measurement (40.8)
    expect(response.body).toEqual({
      data: [
        {
          recipeId: 'seed-rec-001',
          recipeName: '110mm Brick Wall',
          description: 'North elevation brick wall',
          measurement: 40.8,
          unit: 'm²',
          notes: 'Window openings deducted',
          materials: [
            {
              materialId: 'seed-mat-001',
              name: 'Clay Brick',
              calculatedQuantity: 2448,
              unit: 'Nr',
            }, // 60 * 40.8
            {
              materialId: 'seed-mat-002',
              name: 'Cement Mix',
              calculatedQuantity: 0.816,
              unit: 'm³',
            }, // 0.02 * 40.8
          ],
          labour: [
            {
              labourId: 'seed-lab-001',
              name: 'Bricklayer',
              calculatedHours: 40.8,
              unit: 'hr',
            }, // 1 * 40.8
            {
              labourId: 'seed-lab-002',
              name: 'Labourer',
              calculatedHours: 20.4,
              unit: 'hr',
            }, // 0.5 * 40.8
          ],
          overheads: [
            {
              overheadId: 'seed-ovh-001',
              name: 'Scaffolding',
              calculatedDuration: 4.08,
              unit: 'week',
            }, // 0.1 * 40.8
          ],
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  it('PUT /:companyId/projects/:projectId/bill-of-quantities', async () => {
    // Controller types the body as LineItems[], which requires the takeoff item's
    // own `id` (not recipeId) plus every column on the TakeoffItem model.
    // Using the deterministic seed ids from the seed-fix (seed-takeoff-001/002),
    // both belonging to seed-proj-001, so they match `baseUrl` above.
    const bulkLineItems = [
      {
        id: 'seed-takeoff-001',
        userId: 'seed-user-001',
        companyId: 'seed-company-001',
        projectId: 'seed-proj-001',
        recipeId: 'seed-rec-001',
        description: 'North elevation brick wall',
        measurement: 42.0, // updated from 40.8
        unit: 'm²',
        notes: 'Adjusted window deduction area',
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        updatedAt: new Date('2026-01-15T00:00:00.000Z'),
      },
      {
        id: 'seed-takeoff-002',
        userId: 'seed-user-001',
        companyId: 'seed-company-001',
        projectId: 'seed-proj-001',
        recipeId: 'seed-rec-002',
        description: 'Ground floor slab',
        measurement: 85.0,
        unit: 'm²',
        notes: null,
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        updatedAt: new Date('2026-01-15T00:00:00.000Z'),
      },
    ];

    const response = await request(app.getHttpServer())
      .put(`${baseUrl}/bill-of-quantities`)
      .send(bulkLineItems)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      updatedCount: 2,
      items: expect.arrayContaining([
        expect.objectContaining({
          id: 'seed-takeoff-001',
          recipeId: 'seed-rec-001',
          measurement: 42.0,
        }),
        expect.objectContaining({
          id: 'seed-takeoff-002',
          recipeId: 'seed-rec-002',
          measurement: 85.0,
        }),
      ]),
    });
  });

  it('PATCH /:companyId/projects/:projectId/bill-of-quantities/status', async () => {
    const statusPayload = { completed: true };

    const response = await request(app.getHttpServer())
      .patch(`${baseUrl}/bill-of-quantities/status`)
      .send(statusPayload)
      .expect(200);

    expect(response.body).toEqual({
      confirmation: true,
      projectId: 'seed-proj-001',
      completed: true,
    });
  });

  it('DELETE /:companyId/projects/:projectId/bill-of-quantities/recipes', async () => {
    // Controller signature: @Body() lineItems: { LineItemId: string }[]
    // Deleting a single specific takeoff item, referenced by its own id.
    const deletePayload = [{ LineItemId: 'seed-takeoff-001' }];

    const response = await request(app.getHttpServer())
      .delete(`${baseUrl}/bill-of-quantities/recipes`)
      .send(deletePayload)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      count: 1,
    });
  });

  it('DELETE /:companyId/projects/:projectId/bill-of-quantities', async () => {
    // seed-proj-001 has 2 takeoff items in the seed data
    // (seed-takeoff-001, seed-takeoff-002)
    const response = await request(app.getHttpServer())
      .delete(`${baseUrl}/bill-of-quantities`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      clearedCount: 2,
    });
  });

  it('DELETE /:companyId/projects/:projectId', async () => {
    const response = await request(app.getHttpServer())
      .delete(baseUrl)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      deletedProjectId: 'seed-proj-001',
    });
  });
});
