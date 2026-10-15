// The shapes the shared "Create recipe" form works with. The form is used by
// more than one screen (the takeoff's Add line item and the recipe library), and
// each screen talks to its own backend routes, so the form never calls an API
// itself: the screen hands it a CreateRecipeApi with the four calls it needs.

// The three kinds of component a recipe is made of. A new catalogue item is
// created as exactly one of them.
export type CatalogueKind = "material" | "labour" | "overhead";

export type CatalogueCategory = { id: string; name: string };

// A material, labour or overhead as the form lists it
export type CatalogueItem = {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
};

// Everything a recipe can be built from
export type RecipeCatalogue = {
  categories: CatalogueCategory[];
  materials: CatalogueItem[];
  labour: CatalogueItem[];
  overheads: CatalogueItem[];
};

// A missing catalogue item to create. `labourType` only applies to labour.
export type NewCatalogueItem = {
  kind: CatalogueKind;
  name: string;
  unit: string;
  categoryId: string;
  labourType: string | null;
};

// One thing a recipe is made of and how much of it 1 unit of the recipe needs
export type NewRecipeComponent = {
  itemId: string;
  quantity: number;
};

export type NewRecipe = {
  name: string;
  categoryId: string;
  // What the recipe is priced per, for example m² for a wall
  unit: string;
  description: string | null;
  materials: NewRecipeComponent[];
  labour: NewRecipeComponent[];
  overheads: NewRecipeComponent[];
};

// The four calls the form makes, bound by the screen to its company (and
// project). `TCreated` is the shape the screen gets back for a saved recipe:
// the takeoff's picker and the library list recipes differently.
// The object must be stable between renders (build it with useMemo), because
// the form loads the catalogue when it appears.
export type CreateRecipeApi<TCreated> = {
  loadCatalogue: () => Promise<RecipeCatalogue>;
  createCatalogueItem: (item: NewCatalogueItem) => Promise<CatalogueItem>;
  createCategory: (name: string) => Promise<CatalogueCategory>;
  createRecipe: (recipe: NewRecipe) => Promise<TCreated>;
};