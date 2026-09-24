import type { Category } from "@/modules/recipeLibrary/contracts/types";

const ALL_CATEGORIES_ID = "all";

export function RecipeCategoryList({
  categoryList,
  selectedCategoryId,
  onSelectCategory,
}: {
  categoryList: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}) {
  return (
    <ul className="flex w-1/6 flex-col gap-2">
      {categoryList.length > 0
        ? categoryList.map((category) => {
            const isActive = category.categoryId === selectedCategoryId;
            return (
              <li key={category.categoryId} className="w-full">
                <button
                  onClick={() => onSelectCategory(category.categoryId)}
                  className={
                    isActive
                      ? "inline-flex w-full items-center justify-between rounded-md border border-zinc-900 bg-zinc-900 px-3 py-2 text-left text-sm font-medium text-white shadow-sm cursor-pointer"
                      : "inline-flex w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer"
                  }
                >
                  <span>{category.categoryName}</span>
                  <span className={isActive ? "text-zinc-300" : "text-zinc-400"}>
                    {category.numberOfRecipes}
                  </span>
                </button>
              </li>
            );
          })
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