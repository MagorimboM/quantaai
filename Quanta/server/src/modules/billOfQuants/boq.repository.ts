import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type {
  BillOfQuantsScope,
  UpdateProjectLineItemsRequest,
  UpdateProjectStatusRequest,
  DeleteProjectLineItemsRequest,
} from '@/modules/billOfQuants/contracts/boq.request.contracts';
import type {
  GetBillOfQuantsResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantsResponse,
} from '@/modules/billOfQuants/contracts/boq.response.contracts';

// Every method here assumes the caller was already checked to own the project
// (see AccessService), so queries only need to stay inside its company and project.
//
// A takeoff is stored as takeoff_items: one row per line, each pointing at the
// recipe it applies and holding the measurement the quantities are worked out from.
@Injectable()
export class BillOfQuantsRepository {
  // Every line of the project's takeoff, each with its recipe and the
  // components needed to calculate quantities. Only the fields the screen uses
  // are read. The order is stable so lines don't shuffle after a save:
  // createdAt alone isn't enough (rows inserted in one statement share a
  // timestamp), so id is the tie-breaker.
  async getProjectBillOfQuants(
    request: BillOfQuantsScope,
  ): Promise<GetBillOfQuantsResponse[]> {
    return await prisma.takeoffItem.findMany({
      where: { companyId: request.companyId, projectId: request.projectId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        description: true,
        measurement: true,
        unit: true,
        notes: true,
        recipe: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: { select: { id: true, name: true } },
            recipeMaterials: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                material: { select: { id: true, name: true } },
              },
            },
            recipeLabour: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                labour: { select: { id: true, name: true } },
              },
            },
            recipeOverheads: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                overhead: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  // Saves the edited location, notes and measurement of several lines at once.
  // All or nothing: if any line isn't in this project, nothing is saved.
  async updateProjectLineItems(
    request: UpdateProjectLineItemsRequest,
  ): Promise<UpdateLineItemsResponse> {
    const ids = request.lineItems.map((item) => item.id);

    return await prisma.$transaction(async (tx) => {
      // One query finds which of the lines really belong to this project
      const existing = await tx.takeoffItem.findMany({
        where: {
          id: { in: ids },
          companyId: request.companyId,
          projectId: request.projectId,
        },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((item) => item.id));
      const missing = ids.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(
          `Line items not found in this project: ${missing.join(', ')}`,
        );
      }

      for (const item of request.lineItems) {
        await tx.takeoffItem.update({
          where: { id: item.id },
          data: {
            description: item.description,
            measurement: item.measurement,
            notes: item.notes,
          },
        });
      }

      return { success: true, updatedItems: request.lineItems.length };
    });
  }

  // Marks the project's takeoff finished or reopens it. The status shown on the
  // projects list, the completed flag the dashboard counts, and the completion
  // time are all kept in step, so they can't disagree.
  async updateProjectStatus(
    request: UpdateProjectStatusRequest,
  ): Promise<UpdateProjectStatusResponse> {
    return await prisma.project.update({
      where: { id: request.projectId, companyId: request.companyId },
      data: {
        completed: request.completed,
        completedAt: request.completed ? new Date() : null,
        status: request.completed ? 'completed' : 'in_progress',
      },
      select: { id: true, completed: true },
    });
  }

  // Deletes the chosen lines. All or nothing: if any isn't in this project,
  // nothing is deleted. Returns the ids that were deleted.
  async deleteProjectLineItems(
    request: DeleteProjectLineItemsRequest,
  ): Promise<DeletedLineItemsResponse> {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.takeoffItem.findMany({
        where: {
          id: { in: request.lineItemIds },
          companyId: request.companyId,
          projectId: request.projectId,
        },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((item) => item.id));
      const missing = request.lineItemIds.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(
          `Line items not found in this project: ${missing.join(', ')}`,
        );
      }

      await tx.takeoffItem.deleteMany({
        where: {
          id: { in: [...existingIds] },
          companyId: request.companyId,
          projectId: request.projectId,
        },
      });

      return [...existingIds].map((id) => ({ id }));
    });
  }

  // "Start afresh": removes every line of the project's takeoff. The project
  // itself stays.
  async deleteProjectBillOfQuants(
    request: BillOfQuantsScope,
  ): Promise<DeleteProjectBillOfQuantsResponse> {
    const deleted = await prisma.takeoffItem.deleteMany({
      where: { projectId: request.projectId, companyId: request.companyId },
    });

    return { success: true, deletedItems: deleted.count };
  }
}