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

export type GetRecipesResponse = {
  totalCount: number;
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