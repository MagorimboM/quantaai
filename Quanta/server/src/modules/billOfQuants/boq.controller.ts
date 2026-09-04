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

import {
  Controller,
  Put,
  Patch,
  Get,
  Delete,
  Post,
  Param,
  Query,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BillOfQuantsService } from './boq.service';

type LineItems = {
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

@Controller(':companyId/projects/:projectId')
export class BillOfQuantsController {
  constructor(private readonly billOfQuantsService: BillOfQuantsService) {}

  /**
   * GET /:companyId/projects/:projectId/bill-of-quantities?query={term}&page={1}&limit={10}
   * Unified endpoint: handles regular paginated fetch AND search queries seamlessly.
   */
  @Get('bill-of-quantities')
  async getProjectBillOfQuants(
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    // Returns array of nested BOQ objects + pagination metadata
    return await this.billOfQuantsService.getProjectBillOfQuants({
      companyId: companyId,
      projectId: projectId,
      query: query,
      page: page,
      limit: limit,
    });
  }

  /**
   * PUT /:companyId/projects/:projectId/bill-of-quantities
   * Bulk save/update line items.
   */
  @Put('bill-of-quantities')
  async updateProjectLineItems(
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body() lineItems: LineItems[], // Pass your BOQ Item DTO here
  ) {
    // Returns array of updated nested objects + save confirmation
    return await this.billOfQuantsService.updateProjectLineItems({
      companyId: companyId,
      projectId: projectId,
      lineItems: lineItems,
    });
  }

  /**
   * PATCH /:companyId/projects/:projectId/bill-of-quantities/status
   * Mark project takeoff as active or completed.
   */
  @Patch('bill-of-quantities/status')
  async updateProjectStatus(
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body('completed') completed: boolean,
  ) {
    // Returns { confirmation: true }
    return await this.billOfQuantsService.updateProjectStatus({
      companyId: companyId,
      projectId: projectId,
      completed: completed,
    });
  }

  /**
   * DELETE /:companyId/projects/:projectId/bill-of-quantities/recipes
   * Delete specific selected line items (pass array of IDs in body).
   */
  @Post('bill-of-quantities/delete')
  async deleteProjectLineItems(
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body() lineItems: { id: string }[],
  ) {
    // Returns { success: true, count: number }
    return await this.billOfQuantsService.deleteProjectLineItems({
      companyId: companyId,
      projectId: projectId,
      lineItems: lineItems,
    });
  }

  /**
   * DELETE /:companyId/projects/:projectId/bill-of-quantities
   * Clear all recipes and line items for this project.
   */
  @Delete('bill-of-quantities')
  async deleteProjectBillOfQuants(
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
  ) {
    // Returns { success: true, clearedCount: number }
    return await this.billOfQuantsService.deleteProjectBillOfQuants({
      companyId: companyId,
      projectId: projectId,
    });
  }

  /**
   * DELETE /:companyId/projects/:projectId
   * Delete the entire project entity and all connected data.
   */
  @Delete()
  async deleteProject(
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
  ) {
    // Returns { success: true, deletedProjectId: string }
    return await this.billOfQuantsService.deleteProject({
      companyId: companyId,
      projectId: projectId,
    });
  }
}
