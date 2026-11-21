// The shapes the shared "Create recipe" form works with. The form is used by
// more than one screen (the takeoff's Add line item and the recipe library), and
// each screen talks to its own backend routes, so the form never calls an API
// itself: the screen hands it a CreateRecipeApi with the calls it needs.

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

// A building class or site class as the form lists it
export type RecipeClassOption = {
  id: string;
  name: string;
  description: string;
};

// The building classes and site classes a recipe can suit
export type RecipeClasses = {
  buildingClasses: RecipeClassOption[];
  siteClasses: RecipeClassOption[];
};

// A building class or site class the user is adding. The description is shown
// on hover and in the library, so it is kept short.
export type NewRecipeClass = {
  name: string;
  description: string;
};

// The earlier name for the same shape, kept so existing imports still work
export type NewSiteClass = NewRecipeClass;

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

// buildingClassIds / siteClassIds: the classes the recipe suits. Both are
// empty when the screen offers no classes (see `loadClasses` below).
export type NewRecipe = {
  name: string;
  categoryId: string;
  // What the recipe is priced per, for example m² for a wall
  unit: string;
  description: string | null;
  materials: NewRecipeComponent[];
  labour: NewRecipeComponent[];
  overheads: NewRecipeComponent[];
  buildingClassIds: string[];
  siteClassIds: string[];
};

// The calls the form makes, bound by the screen to its company (and project).
// `TCreated` is the shape the screen gets back for a saved recipe: the
// takeoff's picker and the library list recipes differently.
// The object must be stable between renders (build it with useMemo), because
// the form loads the catalogue when it appears.
//
// The class calls are optional. A screen that gives `loadClasses` gets the
// "Where it applies" section, and at least one building class becomes
// required. Without it the section is hidden. `createBuildingClass` and
// `createSiteClass` add the "Add building class" and "Add site class" chips,
// so the user can build up their lists from the form, starting from none.
export type CreateRecipeApi<TCreated> = {
  loadCatalogue: () => Promise<RecipeCatalogue>;
  createCatalogueItem: (item: NewCatalogueItem) => Promise<CatalogueItem>;
  createCategory: (name: string) => Promise<CatalogueCategory>;
  createRecipe: (recipe: NewRecipe) => Promise<TCreated>;
  loadClasses?: () => Promise<RecipeClasses>;
  createBuildingClass?: (
    buildingClass: NewRecipeClass,
  ) => Promise<RecipeClassOption>;
  createSiteClass?: (siteClass: NewRecipeClass) => Promise<RecipeClassOption>;
};