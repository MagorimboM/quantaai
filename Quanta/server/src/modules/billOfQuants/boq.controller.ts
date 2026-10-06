import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { BillOfQuantsService } from '@/modules/billOfQuants/boq.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import type { LineItemInput } from '@/modules/billOfQuants/contracts/boq.request.contracts';
import type {
  GetBillOfQuantsResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantsResponse,
} from '@/modules/billOfQuants/contracts/boq.response.contracts';

// The takeoff (bill of quantities) of one project. Every route runs behind the
// global ClerkAuthGuard, so @ClerkUserId() is the verified caller; the service
// checks the company and project in the URL are really theirs.
@Controller(':companyId/projects/:projectId/bill-of-quantities')
export class BillOfQuantsController {
  constructor(private readonly billOfQuantsService: BillOfQuantsService) {}

  // GET .../bill-of-quantities
  // Every line of the takeoff, each with its recipe.
  @Get()
  async getProjectBillOfQuants(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
  ): Promise<GetBillOfQuantsResponse[]> {
    return await this.billOfQuantsService.getProjectBillOfQuants({
      clerkId,
      companyId,
      projectId,
    });
  }

  // PUT .../bill-of-quantities
  // Saves the edited location, notes and measurement of the lines in the body.
  @Put()
  async updateProjectLineItems(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body() lineItems: LineItemInput[],
  ): Promise<UpdateLineItemsResponse> {
    return await this.billOfQuantsService.updateProjectLineItems({
      clerkId,
      companyId,
      projectId,
      lineItems,
    });
  }

  // PATCH .../bill-of-quantities/status   body: { completed: boolean }
  // Marks the takeoff complete, or reopens it.
  @Patch('status')
  async updateProjectStatus(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body('completed') completed: boolean,
  ): Promise<UpdateProjectStatusResponse> {
    return await this.billOfQuantsService.updateProjectStatus({
      clerkId,
      companyId,
      projectId,
      completed,
    });
  }

  // POST .../bill-of-quantities/delete   body: { lineItemIds: string[] }
  // Deletes the chosen lines. A POST because the ids travel in the body.
  @Post('delete')
  async deleteProjectLineItems(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body('lineItemIds') lineItemIds: string[],
  ): Promise<DeletedLineItemsResponse> {
    return await this.billOfQuantsService.deleteProjectLineItems({
      clerkId,
      companyId,
      projectId,
      lineItemIds,
    });
  }

  // DELETE .../bill-of-quantities
  // "Start afresh": removes every line. The project itself stays.
  @Delete()
  async deleteProjectBillOfQuants(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
  ): Promise<DeleteProjectBillOfQuantsResponse> {
    return await this.billOfQuantsService.deleteProjectBillOfQuants({
      clerkId,
      companyId,
      projectId,
    });
  }
}