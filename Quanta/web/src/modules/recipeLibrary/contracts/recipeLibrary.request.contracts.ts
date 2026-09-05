import type { Dispatch, SetStateAction } from "react";
import type { Recipe } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

export type SearchRecipeRequest = {
  term: string;
  page: number;
  limit: number;
  companyId: string;
  categoryId: string;
};

export type UserRecipeCategoriesRequest = {
  companyId: string;
};

export type SetRecipeListState = Dispatch<SetStateAction<Recipe[]>>;