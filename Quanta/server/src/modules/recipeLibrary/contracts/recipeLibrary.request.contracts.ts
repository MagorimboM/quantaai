export type GetCategoryRecipeRequest = {
  categoryId: string;
  companyId: string;
};

export type UserRecipeCategoriesRequest = {
  companyId: string;
};

export type SearchRecipeRequest = {
  companyId: string;
  categoryId: string;
  term: string;
  limit: number;
  page: number;
};