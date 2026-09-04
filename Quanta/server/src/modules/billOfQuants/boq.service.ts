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

import { Injectable } from '@nestjs/common';
import { BillOfQuantsRepository } from '@/modules/billOfQuants/boq.repository';

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

@Injectable()
export class BillOfQuantsService {
  constructor(
    private readonly billOfQuantsRepository: BillOfQuantsRepository,
  ) {}

  /**
   * GET /:companyId/projects/:projectId/bill-of-quantities?query={term}&page={1}&limit={10}
   * Unified endpoint: handles regular paginated fetch AND search queries seamlessly.
   */
  async getProjectBillOfQuants(request: {
    companyId: string;
    projectId: string;
    query?: string;
    page?: number;
    limit?: number;
  }) {
    // Returns array of nested BOQ objects + pagination metadata
    return await this.billOfQuantsRepository.getProjectBillOfQuants(request);
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
    // Returns array of updated nested objects + save confirmation
    return await this.billOfQuantsRepository.updateProjectLineItems(request);
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
    // Returns { confirmation: true }
    return await this.billOfQuantsRepository.updateProjectStatus(request);
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
    // Returns { success: true, count: number }
    return await this.billOfQuantsRepository.deleteProjectLineItems(request);
  }

  /**
   * DELETE /:companyId/projects/:projectId/bill-of-quantities
   * Clear all recipes and line items for this project.
   */
  async deleteProjectBillOfQuants(request:{
    companyId: string;
    projectId: string;
  }) {
    // Returns { success: true, clearedCount: number }
    return await this.billOfQuantsRepository.deleteProjectBillOfQuants(request);
  }

  /**
   * DELETE /:companyId/projects/:projectId
   * Delete the entire project entity and all connected data.
   */

  async deleteProject(request: { companyId: string; projectId: string }) {
    // Returns { success: true, deletedProjectId: string }
    return await this.billOfQuantsRepository.deleteProject(request);
  }
}
