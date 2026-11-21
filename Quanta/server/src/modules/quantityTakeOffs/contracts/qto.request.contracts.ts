import type { z } from 'zod';
import type {
  addLineItemSchema,
  createCatalogueItemSchema,
  createCategorySchema,
  createRecipeSchema,
  updateLineItemsSchema,
} from '@/modules/quantityTakeOffs/contracts/qto.schema';

// The bodies the routes accept come from the Zod schemas in qto.schema.ts, so
// the rules and the types can't drift apart. Each is what the route receives
// once ZodValidationPipe has checked it: text tidied, ids present, numbers real
// and above zero, blank notes null.

// Which project's takeoff a repository call is about. By the time a repository
// method runs, the caller has been checked to own both (see AccessService).
export type BillOfQuantsScope = {
  companyId: string;
  projectId: string;
};

// The three fields a user can edit on a line item. The location is stored in
// `description`. Everything else on the line (recipe, unit) is fixed once created.
export type LineItemInput = z.output<typeof updateLineItemsSchema>[number];

export type UpdateProjectLineItemsRequest = BillOfQuantsScope & {
  lineItems: LineItemInput[];
};

// completed = true marks the takeoff finished; false reopens it
export type UpdateProjectStatusRequest = BillOfQuantsScope & {
  completed: boolean;
};

export type DeleteProjectLineItemsRequest = BillOfQuantsScope & {
  lineItemIds: string[];
};

// The recipes a company can put on a takeoff
export type GetRecipeOptionsRequest = {
  companyId: string;
};

// What the browser sends to add a line: the recipe, the one measurement it is
// multiplied by, and where it is (stored in `description`).
export type AddLineItemInput = z.output<typeof addLineItemSchema>;

// The same, once the caller is known. `userId` comes from the Clerk token and
// is never sent by the browser.
export type AddLineItemRequest = BillOfQuantsScope &
  AddLineItemInput & {
    userId: string;
  };

// ---- Create recipe ----

// The three kinds of component a recipe is made of. A new catalogue item is
// created as exactly one of them.
export type CatalogueKind = 'material' | 'labour' | 'overhead';

// The materials, labour and overheads a company can build recipes from
export type GetRecipeCatalogueRequest = {
  companyId: string;
};

// What the browser sends to add a material, labour or overhead to the
// catalogue. `labourType` only applies to labour and is null for the others.
export type CreateCatalogueItemInput = z.output<typeof createCatalogueItemSchema>;

// The same, once the caller is known. `userId` comes from the Clerk token and
// is never sent by the browser.
export type CreateCatalogueItemRequest = CreateCatalogueItemInput & {
  userId: string;
  companyId: string;
};

export type CreateCategoryInput = z.output<typeof createCategorySchema>;

export type CreateCategoryRequest = CreateCategoryInput & {
  userId: string;
  companyId: string;
};

// A recipe created from the takeoff. The same rules as the recipe library's,
// including the optional buildingClassIds / siteClassIds (no repeats).
// `description` is null when blank.
export type CreateRecipeInput = z.output<typeof createRecipeSchema>;

// One component of a recipe: the catalogue item and how much of it 1 unit of
// the recipe needs. The component's unit is not sent: it is the item's own unit.
export type RecipeComponentInput = CreateRecipeInput['materials'][number];

export type CreateRecipeRequest = CreateRecipeInput & {
  userId: string;
  companyId: string;
};