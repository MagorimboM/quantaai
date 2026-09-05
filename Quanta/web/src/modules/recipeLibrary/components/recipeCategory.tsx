import { getCategoryRecipe } from "@/modules/recipeLibrary/api/api";
import type {
  Category,
  SetRecipeListState,
} from "@/modules/recipeLibrary/contracts/types";

export function RecipeCategoryList({
  categoryList,
  recipeListUpdater,
}: {
  categoryList: Category[];
  recipeListUpdater: SetRecipeListState;
}) {
  async function fetchCategoryRecipe(request: {
    categoryId: string;
    companyId: string;
  }) {
    const response = await getCategoryRecipe({
      categoryId: request.categoryId,
      companyId: request.companyId,
      page: 1,
      limit: 10,
    });

    recipeListUpdater(response);
  }

  return (
    <ul className="flex w-1/6 flex-col gap-2">
      {categoryList.length > 0
        ? categoryList.map((category) => (
            <li key={category.categoryId} className="w-full">
              <button
                onClick={() => fetchCategoryRecipe(category)}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-between
                  rounded-md
                  border
                  border-zinc-300
                  bg-white
                  px-3
                  py-2
                  text-left
                  text-sm
                  font-medium
                  text-zinc-700
                  shadow-sm
                  transition-colors
                  hover:bg-zinc-50
                  hover:text-zinc-900
                  cursor-pointer
                "
              >
                <span>{category.categoryName}</span>
                <span className="text-zinc-400">
                  {category.numberOfRecipes}
                </span>
              </button>
            </li>
          ))
        : Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="w-full">
              <div className="w-full animate-pulse rounded-md border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-zinc-200" />
                  <div className="h-4 w-8 rounded bg-zinc-100" />
                </div>
              </div>
            </li>
          ))}
    </ul>
  );
}
