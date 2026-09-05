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

export type UserRecipeCategoriesResponse = {
  companyId: string;
  companyName: string;
  categories: Category[];
};


