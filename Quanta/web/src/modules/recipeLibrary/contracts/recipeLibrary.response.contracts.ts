export type Category = {
  companyId: string;
  companyName: string;
  categoryName: string;
  categoryId: string;
  numberOfRecipes: number;
};

export type UserRecipeCategoriesResponse = {
  companyId: string;
  companyName: string;
  categories: Category[];
};
