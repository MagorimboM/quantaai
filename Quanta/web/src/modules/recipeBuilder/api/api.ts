import { apiClient } from "@/core/api/axios.api";
type NewRecipe = {
  categoryId: string;
  recipeName: string;
  recipeCode: string;
  recipeDescription: string;
  recipeUnitMeasure: string;
  ingredients: {
    materialId: string;
    unitMeasureId: string;
    quantity: string;
  }[];
};

export async function getMaterialsAndCategories(
  query: string,
  companyId: string,
  categoryId: string,
) {
  // localhost:3000/api/seed-company-001/recipe/new-recipe/i/seed-cat-001/materials_and_categories

  let term: string = "all";

  if (query.length > 0) {
    term = query;
  }; 

  const response = await apiClient.get(
    `/${companyId}/recipe/new-recipe/${term}/${categoryId}/materials_and_categories`,
  );
  return response.data;
}

export async function getRecipeCategories(companyId: string) {
  // localhost:3000/api/seed-company-001/recipe/new-recipe/recipe_categories
  const response = await apiClient.get(
    `${companyId}/recipe/new-recipe/recipe_categories`,
  );
  return response.data;
}

export async function createNewRecipe(companyId: string, request: NewRecipe) {
  const response = await apiClient.post(
    `${companyId}/recipe/new-recipe`,
    request,
  );
  return response.data;
}
