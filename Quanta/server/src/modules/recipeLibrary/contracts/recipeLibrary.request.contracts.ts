export type GetCategoryRecipeRequest = {
  categoryId: string;
  companyId: string;
};

export type UserRecipeCategoriesRequest = {
  companyId: string;
  userId?: string;
};
