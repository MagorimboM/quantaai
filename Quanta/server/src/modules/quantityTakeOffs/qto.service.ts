import { BadRequestException, Injectable } from '@nestjs/common';
import { QuantityTakeOffsRepository } from '@/modules/quantityTakeOffs/qto.repository';
import { AccessService } from '@/auth/services/access.service';
import type {
  LineItemInput,
  AddLineItemInput,
  CreateCatalogueItemInput,
  CreateCategoryInput,
  CreateRecipeInput,
  RecipeComponentInput,
} from '@/modules/quantityTakeOffs/contracts/qto.request.contracts';
import type {
  GetBillOfQuantsResponse,
  GetRecipeOptionsResponse,
  GetRecipeCatalogueResponse,
  CreateCatalogueItemResponse,
  CreateCategoryResponse,
  CreateRecipeResponse,
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

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

// A catalogue item needs a name, the unit it is counted in and a category.
// Labour also has a type; the other kinds don't.
function assertValidCatalogueItem(item: CreateCatalogueItemInput) {
  if (!['material', 'labour', 'overhead'].includes(item?.kind)) {
    throw new BadRequestException('The kind must be material, labour or overhead');
  }
  if (!isNonEmptyText(item.name)) {
    throw new BadRequestException('A name is required');
  }
  if (!isNonEmptyText(item.unit)) {
    throw new BadRequestException('A unit is required');
  }
  if (!isNonEmptyText(item.categoryId)) {
    throw new BadRequestException('A category is required');
  }
  if (item.kind === 'labour' && !isNonEmptyText(item.labourType)) {
    throw new BadRequestException('A labour type is required');
  }
}

// Each component needs a real quantity above zero, and the same item can't be
// listed twice in one section (it would be two rows for one thing).
function assertValidComponents(components: RecipeComponentInput[], label: string) {
  if (!Array.isArray(components)) {
    throw new BadRequestException(`Expected a list of ${label}`);
  }
  const seen = new Set<string>();
  for (const component of components) {
    if (!isNonEmptyText(component?.itemId)) {
      throw new BadRequestException(`A ${label} entry has no item`);
    }
    if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
      throw new BadRequestException(`Every ${label} quantity must be above zero`);
    }
    if (seen.has(component.itemId)) {
      throw new BadRequestException(`A ${label} item is listed twice`);
    }
    seen.add(component.itemId);
  }
}

// A recipe is only useful with a name, a category, the unit it is priced per
// and at least one thing it is made of.
function assertValidNewRecipe(recipe: CreateRecipeInput) {
  if (!isNonEmptyText(recipe?.name)) {
    throw new BadRequestException('A name is required');
  }
  if (!isNonEmptyText(recipe.categoryId)) {
    throw new BadRequestException('A category is required');
  }
  if (!isNonEmptyText(recipe.unit)) {
    throw new BadRequestException('A unit is required');
  }
  if (recipe.description !== null && typeof recipe.description !== 'string') {
    throw new BadRequestException('The description must be text or empty');
  }
  assertValidComponents(recipe.materials, 'material');
  assertValidComponents(recipe.labour, 'labour');
  assertValidComponents(recipe.overheads, 'overhead');
  if (
    recipe.materials.length + recipe.labour.length + recipe.overheads.length ===
    0
  ) {
    throw new BadRequestException('A recipe needs at least one component');
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

  async getRecipeCatalogue(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
  }): Promise<GetRecipeCatalogueResponse> {
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    return await this.quantityTakeOffsRepository.getRecipeCatalogue({
      companyId: request.companyId,
    });
  }

  async createCatalogueItem(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
    item: CreateCatalogueItemInput;
  }): Promise<CreateCatalogueItemResponse> {
    assertValidCatalogueItem(request.item);
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    const userId = await this.accessService.getUserId(request.clerkId);
    return await this.quantityTakeOffsRepository.createCatalogueItem({
      userId,
      companyId: request.companyId,
      kind: request.item.kind,
      name: request.item.name.trim(),
      unit: request.item.unit.trim(),
      categoryId: request.item.categoryId,
      labourType:
        request.item.kind === 'labour' ? request.item.labourType!.trim() : null,
    });
  }

  async createCategory(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
    category: CreateCategoryInput;
  }): Promise<CreateCategoryResponse> {
    if (!isNonEmptyText(request.category?.name)) {
      throw new BadRequestException('A name is required');
    }
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    const userId = await this.accessService.getUserId(request.clerkId);
    return await this.quantityTakeOffsRepository.createCategory({
      userId,
      companyId: request.companyId,
      name: request.category.name.trim(),
    });
  }

  async createRecipe(request: {
    clerkId: string;
    companyId: string;
    projectId: string;
    recipe: CreateRecipeInput;
  }): Promise<CreateRecipeResponse> {
    assertValidNewRecipe(request.recipe);
    await this.accessService.requireProjectAccess(
      request.clerkId,
      request.companyId,
      request.projectId,
    );
    const userId = await this.accessService.getUserId(request.clerkId);
    return await this.quantityTakeOffsRepository.createRecipe({
      userId,
      companyId: request.companyId,
      name: request.recipe.name.trim(),
      categoryId: request.recipe.categoryId,
      unit: request.recipe.unit.trim(),
      description: request.recipe.description?.trim() || null,
      materials: request.recipe.materials,
      labour: request.recipe.labour,
      overheads: request.recipe.overheads,
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