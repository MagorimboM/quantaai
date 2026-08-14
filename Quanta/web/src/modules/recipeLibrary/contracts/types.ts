import type { Dispatch, SetStateAction } from "react";

export type Materials = {
  name: string;
  unitMeasureQuant: string;
  unitMeasure: string;
};

export type Category = {
  companyId: string;
  companyName: string;
  categoryName: string;
  categoryId: string;
  numberOfRecipes: number;
};

export type Recipe = {
  companyId: string;
  categoryId: string;
  categoryName: string;
  recipeId: string;
  recipeName: string;
  recipeDescription: string;
  recipeTags: string[];
  recipeMaterials: Materials[];
};

// Real React dispatch type (not just (recipes: Recipe[]) => void) so that
// components further down the tree (RecipeForm, RecipeActions) can use the
// functional updater form to patch a single recipe by id, e.g.:
//   setRecipeListState(prev => prev.map(r => r.recipeId === id ? updated : r))
export type SetRecipeListState = Dispatch<SetStateAction<Recipe[]>>;