/* ============================================================================
 * 2. BILL OF QUANTITIES (BOQ) & TAKEOFF MANAGEMENT
 * ============================================================================
 *
 * GET /:companyId/project/:projectId/bill-of-quantities?query={term}&page={1}&limit={10}
 * - Description: Get project recipes and their calculated quantities (with search & pagination).
 * - Query Params: ?query=concrete&page=1&limit=10
 * - Body: None
 * - Returns: Array of nested BOQ recipe objects
 *
 * PUT /:companyId/projects/:projectId/bill-of-quantities
 * - Description: Bulk save/update project bill of quantities line items.
 * - Query Params: None
 * - Body: Array of BOQ objects
 * - Returns: Array of saved objects with confirmation status
 *
 * PATCH /:companyId/projects/:projectId/status
 * - Description: Update project status (mark as complete or active).
 * - Query Params: None
 * - Body: { "completed": true }
 * - Returns: Updated project object with "completed" status confirmation
 *
 * DELETE /:companyId/projects/:projectId/bill-of-quantities/recipes/:recipeId
 * - Description: Delete a single specific recipe item from the project's bill of quantities.
 * - Query Params: None
 * - Body: None
 * - Returns: Confirmation object { "success": true, "deletedRecipeId": "..." }
 *
 * DELETE /:companyId/projects/:projectId/bill-of-quantities/recipes
 * - Description: Delete ALL recipes and associated bill of quantities items for that project.
 * - Query Params: None
 * - Body: None
 * - Returns: Confirmation object { "success": true, "clearedCount": 15 }
 *
 * DELETE /:companyId/projects/:projectId
 * - Description: Delete entire project and all associated BOQ data.
 * - Query Params: None
 * - Body: None
 * - Returns: Confirmation object { "success": true, "deletedId": "..." }
 */

type LineItems = {
  // -- line item detail --
  id: string;
  userId: string | null;
  companyId: string | null;
  projectId: string;
  recipeId: string | null;
  description: string;
  measurement: number;
  unit: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { text } from 'node:stream/consumers';






@Injectable()
export class BillOfQuantsRepository {
  /**
   * GET /:companyId/projects/:projectId/bill-of-quantities?query={term}&page={1}&limit={10}
   * Unified endpoint: handles regular paginated fetch AND search queries seamlessly.
   */

  // TODO :: implement the search term in the find item

  
  async getProjectBillOfQuants(request: {
    companyId: string;
    projectId: string;
    query?: string;
    page?: number;
    limit?: number;
  }) {
    // Returns array of nested BOQ objects + pagination metadata
    // Take offLine item{company project bill of quants}, recipe table, recipeMaterial , recipeLabour, recipeOverheads,  recipeCategory
    // get the line item of the project, get recipe components from the recipe conjunction table.  then return it. where company id= that and project id = that

    const lineItems = await prisma.takeoffItem.findMany({
      where: { companyId: request.companyId, projectId: request.projectId },
      include: {
        recipe: {
          include: {
            recipeMaterials: {
              include: { material: true },
            },
            recipeLabour: {
              include: { labour: true },
            },
            recipeOverheads: {
              include: { overhead: true },
            },
          },
        },
      },
    });

    return lineItems;
  }

  /**
   * PUT /:companyId/projects/:projectId/bill-of-quantities
   * Bulk save/update line items.
   */
  async updateProjectLineItems(
    request: {
      companyId: string;
      projectId: string;
      lineItems: LineItems[];
    }, // Pass your BOQ Item DTO here
  ) {
    const updatedTakeOffItems = await prisma.$transaction(async (tx) => {
      const nonExistingItems: LineItems[] = [];
      let updatedLineItems: LineItems[] = [];

      for (const eachLineItem of request.lineItems) {
        // check if the line item exist, if id does not add it to the array of items that don't exist,
        // then move to the next item

        const existingLineItem = await tx.takeoffItem.findFirst({
          where: {
            id: eachLineItem.id,
            companyId: eachLineItem?.companyId,
            projectId: eachLineItem?.projectId,
          },
        });

        if (existingLineItem == null || !existingLineItem) {
          nonExistingItems.push(eachLineItem);
        }
      }

      // check if the memory has anything that is missing in the item if so throw error. if not
      function summarizeAllNonExistingIds() {
        let itemIds: string = '';
        for (const eachItem of nonExistingItems) {
          itemIds += `-${eachItem.id}\n`;
        }

        return itemIds;
      }
      if (nonExistingItems.length > 0) {
        throw new NotFoundException(
          "Either the line item or components of the line items don't Exist",
          ` The following line items: ${summarizeAllNonExistingIds()}`,
        );
      }

      // update the database
      // for loop again.

      for (const eachLineItem of request.lineItems) {
        const takeOffItemUpdate = await tx.takeoffItem.update({
          where: { id: eachLineItem.id },
          data: {
            description: eachLineItem.description,
            measurement: eachLineItem.measurement,
            notes: eachLineItem.notes,
          },
        });

        updatedLineItems.push(takeOffItemUpdate);
      }

      return updatedLineItems;
    });
    // Returns array of updated nested objects + save confirmation
    return updatedTakeOffItems;
  }

  /**
   * PATCH /:companyId/projects/:projectId/bill-of-quantities/status
   * Mark project takeoff as active or completed.
   */
  async updateProjectStatus(request: {
    companyId: string;
    projectId: string;
    completed: boolean;
  }) {
    const updatedProjectStatus = await prisma.$transaction(async (tx) => {
      // check if the project id exists.
      const projectExists = await tx.project.findFirst({
        where: { id: request?.projectId, companyId: request?.companyId },
      });
      if (!projectExists) {
        throw new NotFoundException('Project does not exist, cannot update');
      }

      const updatedProjectStatus = await tx.project.update({
        where: { id: request.projectId, companyId: request.companyId },
        data: {
          completed: request.completed,
        },
      });

      return updatedProjectStatus;
    });

    return updatedProjectStatus;
  }

  /**
   * DELETE /:companyId/projects/:projectId/bill-of-quantities/recipes
   * Delete specific selected line items (pass array of IDs in body).
   */
  async deleteProjectLineItems(request: {
    companyId: string;
    projectId: string;
    lineItems: { id: string }[];
  }) {
    const deletedLineItems = await prisma.$transaction(async (tx) => {
      // check if the line items exists,

      let unknownLineItems: { unknownLineItemId: string }[] = [];
      function summarizeAllNonExistingIds() {
        let summaryOfUnknownLineItems: string = '';

        for (const eachUnknownLineItem of unknownLineItems) {
          summaryOfUnknownLineItems += `- ${eachUnknownLineItem.unknownLineItemId} \n`;
        }
        return summaryOfUnknownLineItems;
      }

      for (const eachLineItem of request.lineItems) {
        const lineItemExists = await tx.takeoffItem.findFirst({
          where: {
            id: eachLineItem.id,
            projectId: request.projectId,
            companyId: request.companyId,
          },
        });

        if (lineItemExists == null || !lineItemExists) {
          unknownLineItems.push({ unknownLineItemId: eachLineItem.id });
        }
      }

      if (unknownLineItems.length > 0) {
        throw new NotFoundException(
          `The following line items don't exist: ${summarizeAllNonExistingIds()}`,
        );
      }

      let deletedLineItems: {
        id: string;
        userId: string | null;
        companyId: string | null;
        projectId: string;
        recipeId: string | null;
        description: string;
        measurement: number;
        unit: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
      }[] = [];

      for (const eachLineItem of request.lineItems) {
        const deletedItem = await tx.takeoffItem.delete({
          where: { id: eachLineItem.id },
        });

        deletedLineItems.push(deletedItem);
      }

      return deletedLineItems;
    });
    return deletedLineItems;
  }

  /**
   * DELETE /:companyId/projects/:projectId/bill-of-quantities
   * Clear all recipes and line items for this project.
   */
  async deleteProjectBillOfQuants(request: {
    companyId: string;
    projectId: string;
  }) {
    // check if there are any takeOffItems for that projectid,

    const deletedProjectLineItems: { success: boolean; deletedItems: number } =
      await prisma.$transaction(async (tx) => {
        // check if the project even exists

        const projectExists = await tx.project.findFirst({
          where: { id: request.projectId, companyId: request.companyId },
        });

        if (projectExists == null) {
          throw new NotFoundException('Project does not exist');
        }
        // delete line items of that project:
        const deletedProjectLineItems = await tx.takeoffItem.deleteMany({
          where: { projectId: request.projectId, companyId: request.companyId },
        });

        return { success: true, deletedItems: deletedProjectLineItems.count };
      });
    return deletedProjectLineItems;
  }

  /**
   * DELETE /:companyId/projects/:projectId
   * Delete the entire project entity and all connected data.
   */

  async deleteProject(request: { companyId: string; projectId: string }) {
    const deletedProject = await prisma.$transaction(async (tx) => {
      // check if project exists

      const projectExists = await tx.project.findFirst({
        where: { id: request.projectId, companyId: request.companyId },
      });

      if (projectExists == null || !projectExists) {
        throw new NotFoundException(`Project does not exist`);
      }

      const deletedProject = await tx.project.delete({
        where: { id: request.projectId, companyId: request.companyId },
      });

      return deletedProject;
    });

    return deletedProject;
  }
}