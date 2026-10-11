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
import { QuantityTakeOffsService } from '@/modules/quantityTakeOffs/qto.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import type {
  LineItemInput,
  AddLineItemInput,
  CreateCatalogueItemInput,
  CreateCategoryInput,
  CreateRecipeInput,
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

// The takeoff (bill of quantities) of one project. Every route runs behind the
// global ClerkAuthGuard, so @ClerkUserId() is the verified caller; the service
// checks the company and project in the URL are really theirs.
@Controller(':companyId/projects/:projectId/bill-of-quantities')
export class QuantityTakeOffsController {
  constructor(private readonly quantityTakeOffsService: QuantityTakeOffsService) {}

  // GET .../bill-of-quantities
  // Every line of the takeoff, each with its recipe.
  @Get()
  async getProjectBillOfQuants(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
  ): Promise<GetBillOfQuantsResponse[]> {
    return await this.quantityTakeOffsService.getProjectBillOfQuants({
      clerkId,
      companyId,
      projectId,
    });
  }

  // GET .../bill-of-quantities/recipe-options
  // The recipes that can be put on this takeoff, for the "Add line item" picker.
  @Get('recipe-options')
  async getRecipeOptions(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
  ): Promise<GetRecipeOptionsResponse> {
    return await this.quantityTakeOffsService.getRecipeOptions({
      clerkId,
      companyId,
      projectId,
    });
  }

  // GET .../bill-of-quantities/recipe-catalogue
  // The categories, materials, labour and overheads a recipe can be built from.
  @Get('recipe-catalogue')
  async getRecipeCatalogue(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
  ): Promise<GetRecipeCatalogueResponse> {
    return await this.quantityTakeOffsService.getRecipeCatalogue({
      clerkId,
      companyId,
      projectId,
    });
  }

  // POST .../bill-of-quantities/catalogue-items
  //   body: { kind, name, unit, categoryId, labourType }
  // Adds a material, labour or overhead that was missing from the catalogue.
  @Post('catalogue-items')
  async createCatalogueItem(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateCatalogueItemInput,
  ): Promise<CreateCatalogueItemResponse> {
    return await this.quantityTakeOffsService.createCatalogueItem({
      clerkId,
      companyId,
      projectId,
      item: body,
    });
  }

  // POST .../bill-of-quantities/categories   body: { name }
  @Post('categories')
  async createCategory(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateCategoryInput,
  ): Promise<CreateCategoryResponse> {
    return await this.quantityTakeOffsService.createCategory({
      clerkId,
      companyId,
      projectId,
      category: body,
    });
  }

  // POST .../bill-of-quantities/recipes
  //   body: { name, categoryId, unit, description, materials, labour, overheads }
  // Creates a recipe with its components and returns it as the picker lists it.
  @Post('recipes')
  async createRecipe(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateRecipeInput,
  ): Promise<CreateRecipeResponse> {
    return await this.quantityTakeOffsService.createRecipe({
      clerkId,
      companyId,
      projectId,
      recipe: body,
    });
  }

  // POST .../bill-of-quantities   body: { recipeId, measurement, description, notes }
  // Adds one line (a recipe applied to a measurement) and returns it as the
  // takeoff lists it.
  @Post()
  async addLineItem(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Param('projectId') projectId: string,
    @Body() body: AddLineItemInput,
  ): Promise<GetBillOfQuantsResponse> {
    return await this.quantityTakeOffsService.addLineItem({
      clerkId,
      companyId,
      projectId,
      lineItem: body,
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
    return await this.quantityTakeOffsService.updateProjectLineItems({
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
    return await this.quantityTakeOffsService.updateProjectStatus({
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
    return await this.quantityTakeOffsService.deleteProjectLineItems({
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
    return await this.quantityTakeOffsService.deleteProjectBillOfQuants({
      clerkId,
      companyId,
      projectId,
    });
  }
}