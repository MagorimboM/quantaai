// One line of a recipe: a material and how much of it goes into 1 unit of the
// recipe. `id` is the line's own id (used when editing), not the material's.
export type RecipeMaterial = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

// A trade category, with how many live (not archived) recipes it holds
export type Category = {
  companyId: string;
  companyName: string;
  categoryName: string;
  categoryId: string;
  numberOfRecipes: number;
};

// A recipe: what goes into ONE unit of work (`recipeUnit`, for example m²)
export type Recipe = {
  categoryId: string;
  categoryName: string;
  recipeId: string;
  recipeName: string;
  recipeDescription: string;
  recipeUnit: string;
  recipeMaterials: RecipeMaterial[];
};

export type UserRecipeCategoriesResponse = {
  companyId: string;
  companyName: string;
  categories: Category[];
};

// archivedCount: how many archived recipes the same filters would find, for
// the "Show Archived" button
export type GetRecipesResponse = {
  totalCount: number;
  archivedCount: number;
  page: number;
  limit: number;
  recipes: Recipe[];
};

export type ArchiveRecipeResponse = {
  recipeId: string;
  isArchived: boolean;
};

export type DeleteRecipeResponse = {
  success: boolean;
  deletedRecipeId: string;
};

// A site class (soil reactivity, AS 2870), with how many of the company's live
// recipes are linked to it
export type SiteClassItem = {
  siteClassId: string;
  siteClassName: string;
  siteClassDescription: string;
  numberOfRecipes: number;
};

// A building class (NCC), with how many of the company's live recipes are
// linked to it
export type BuildingClassItem = {
  buildingClassId: string;
  buildingClassName: string;
  buildingClassDescription: string;
  numberOfRecipes: number;
};

// A newly added site class. It has no recipes yet.
export type CreateSiteClassResponse = SiteClassItem;

// A newly added building class. It has no recipes yet.
export type CreateBuildingClassResponse = BuildingClassItem;

// The options for the two selectors at the top of the library
export type GetRecipeClassificationsResponse = {
  siteClass: SiteClassItem[];
  buildingClass: BuildingClassItem[];
};

// A category as the recipe form lists it (the library's own `Category` also
// carries the company and a recipe count, which the form doesn't need)
export type CatalogueCategory = { id: string; name: string };

// A material, labour or overhead as the recipe form lists it
export type CatalogueItem = {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
};

export type GetRecipeCatalogueResponse = {
  categories: CatalogueCategory[];
  materials: CatalogueItem[];
  labour: CatalogueItem[];
  overheads: CatalogueItem[];
};

export type CreateCatalogueItemResponse = CatalogueItem;

export type CreateCategoryResponse = CatalogueCategory;

// A new recipe comes back as the library shows recipes: the existing `Recipe`.