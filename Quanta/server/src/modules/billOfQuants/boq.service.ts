import { BadRequestException, Injectable } from '@nestjs/common';
import { BillOfQuantsRepository } from '@/modules/billOfQuants/boq.repository';
import { AccessService } from '@/auth/services/access.service';
import type { LineItemInput } from '@/modules/billOfQuants/contracts/boq.request.contracts';
import type {
  GetBillOfQuantsResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantsResponse,
} from '@/modules/billOfQuants/contracts/boq.response.contracts';

// The measurement is the one number every quantity is calculated from, so it
// has to be a real number that is not negative. Anything else would produce
// nonsense totals (or a database error) further down.
function assertValidLineItems(lineItems: LineItemInput[]) {
  if (!Array.isArray(lineItems)) {
    throw new BadRequestException('Expected a list of line items');
  }
  for (const item of lineItems) {
    if (
      typeof item?.id !== 'string' ||
      !Number.isFinite(item.measurement) ||
      item.measurement < 0
    ) {
      throw new BadRequestException(
        `Invalid measurement for line item ${item?.id}`,
      );
    }
  }
}

// Every method first checks the project really belongs to the caller. The
// company and project ids come from the URL, so on their own they prove nothing.
@Injectable()
export class BillOfQuantsService {
  constructor(
    private readonly billOfQuantsRepository: BillOfQuantsRepository,
    private readonly accessService: AccessService,
  ) {}

  async getProjectBillOfQuants(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
  }): Promise<GetBillOfQuantsResponse[]> {
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    return await this.billOfQuantsRepository.getProjectBillOfQuants({
      companyId: request.companyId,
      projectId: request.projectId,
    });
  }

  async updateProjectLineItems(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
    lineItems: LineItemInput[];
  }): Promise<UpdateLineItemsResponse> {
    assertValidLineItems(request.lineItems);
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    return await this.billOfQuantsRepository.updateProjectLineItems({
      companyId: request.companyId,
      projectId: request.projectId,
      lineItems: request.lineItems,
    });
  }

  async updateProjectStatus(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
    completed: boolean;
  }): Promise<UpdateProjectStatusResponse> {
    if (typeof request.completed !== 'boolean') {
      throw new BadRequestException('"completed" must be true or false');
    }
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    return await this.billOfQuantsRepository.updateProjectStatus({
      companyId: request.companyId,
      projectId: request.projectId,
      completed: request.completed,
    });
  }

  async deleteProjectLineItems(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
    lineItemIds: string[];
  }): Promise<DeletedLineItemsResponse> {
    if (
      !Array.isArray(request.lineItemIds) ||
      request.lineItemIds.length === 0 ||
      !request.lineItemIds.every((id) => typeof id === 'string')
    ) {
      throw new BadRequestException('Expected a list of line item ids');
    }
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    return await this.billOfQuantsRepository.deleteProjectLineItems({
      companyId: request.companyId,
      projectId: request.projectId,
      lineItemIds: request.lineItemIds,
    });
  }

  async deleteProjectBillOfQuants(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
  }): Promise<DeleteProjectBillOfQuantsResponse> {
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    return await this.billOfQuantsRepository.deleteProjectBillOfQuants({
      companyId: request.companyId,
      projectId: request.projectId,
    });
  }
}