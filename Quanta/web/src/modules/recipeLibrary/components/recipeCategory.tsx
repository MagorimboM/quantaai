import type { Category } from "@/modules/recipeLibrary/contracts/types";

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
    <ul className="flex w-1/6 flex-col gap-1.5">
      {categoryList.length > 0
        ? categoryList.map((category) => {
            const isActive = category.categoryId === selectedCategoryId;
            return (
              <li key={category.categoryId} className="w-full">
                <button
                  onClick={() => onSelectCategory(category.categoryId)}
                  className={
                    isActive
                      ? "inline-flex w-full items-center justify-between rounded-lg border border-[#FFD9C9] bg-[#FFF4EE] px-3 py-2 text-left text-sm font-medium text-[#FF6B35] cursor-pointer"
                      : "inline-flex w-full items-center justify-between rounded-lg border border-transparent bg-transparent px-3 py-2 text-left text-sm font-medium text-[#78716C] transition-colors hover:bg-[#FFF4EE] hover:text-[#1C1917] cursor-pointer"
                  }
                >
                  <span>{category.categoryName}</span>
                  <span className={isActive ? "text-[#FF6B35]" : "text-[#A8A29E]"}>
                    {category.numberOfRecipes}
                  </span>
                </button>
              </li>
            );
          })
        : Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="w-full">
              <div className="w-full animate-pulse rounded-lg bg-[#F5F5F4] px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-[#F0EDE8]" />
                  <div className="h-4 w-8 rounded bg-[#F0EDE8]" />
                </div>
              </div>
            </li>
          ))}
    </ul>
  );
}