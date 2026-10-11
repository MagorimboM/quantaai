import { BadRequestException, Injectable } from '@nestjs/common';
import { QuantityTakeOffsRepository } from '@/modules/quantityTakeOffs/qto.repository';
import { AccessService } from '@/auth/services/access.service';
import type {
  LineItemInput,
  AddLineItemInput,
} from '@/modules/quantityTakeOffs/contracts/qto.request.contracts';
import type {
  GetBillOfQuantsResponse,
  GetRecipeOptionsResponse,
  UpdateLineItemsResponse,
  UpdateProjectStatusResponse,
  DeletedLineItemsResponse,
  DeleteProjectBillOfQuantsResponse,
} from '@/modules/quantityTakeOffs/contracts/qto.response.contracts';

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

// A new line has to measure something: zero would add a line that totals
// nothing. (Saving an existing line allows 0 so a measurement can be cleared
// while editing.) Location and notes are optional text.
function assertValidNewLineItem(lineItem: AddLineItemInput) {
  if (typeof lineItem?.recipeId !== 'string' || lineItem.recipeId === '') {
    throw new BadRequestException('A recipe is required');
  }
  if (!Number.isFinite(lineItem.measurement) || lineItem.measurement <= 0) {
    throw new BadRequestException('The measurement must be above zero');
  }
  if (typeof lineItem.description !== 'string') {
    throw new BadRequestException('The location must be text');
  }
  if (lineItem.notes !== null && typeof lineItem.notes !== 'string') {
    throw new BadRequestException('The notes must be text or empty');
  }
}

// Every method first checks the project really belongs to the caller. The
// company and project ids come from the URL, so on their own they prove nothing.
@Injectable()
export class QuantityTakeOffsService {
  constructor(
    private readonly quantityTakeOffsRepository: QuantityTakeOffsRepository,
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
    return await this.quantityTakeOffsRepository.getProjectBillOfQuants({
      companyId: request.companyId,
      projectId: request.projectId,
    });
  }

  async getRecipeOptions(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
  }): Promise<GetRecipeOptionsResponse> {
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    return await this.quantityTakeOffsRepository.getRecipeOptions({
      companyId: request.companyId,
    });
  }

  async addLineItem(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
    lineItem: AddLineItemInput;
  }): Promise<GetBillOfQuantsResponse> {
    assertValidNewLineItem(request.lineItem);
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    const userId = await this.accessService.getUserId(request.clerkId);
    return await this.quantityTakeOffsRepository.addLineItem({
      userId,
      companyId: request.companyId,
      projectId: request.projectId,
      recipeId: request.lineItem.recipeId,
      measurement: request.lineItem.measurement,
      description: request.lineItem.description.trim(),
      notes: request.lineItem.notes?.trim() || null,
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
    return await this.quantityTakeOffsRepository.updateProjectLineItems({
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
    return await this.quantityTakeOffsRepository.updateProjectStatus({
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
    return await this.quantityTakeOffsRepository.deleteProjectLineItems({
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
    return await this.quantityTakeOffsRepository.deleteProjectBillOfQuants({
      companyId: request.companyId,
      projectId: request.projectId,
    });
  }
}