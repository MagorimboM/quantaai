import { MdOutlineCategory, MdOutlineLayers } from "react-icons/md";
import type { Category } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// The "All" entry is a filter, not a real category; it keeps the id "all"
const ALL_CATEGORIES_ID = "all";

// The left column of the library: every category with how many recipes it
// holds, a note on what is being browsed, and a loading placeholder.
export function RecipeCategoryList({
  categoryList,
  selectedCategoryId,
  isArchivedView,
  buildingClassName,
  siteClassName,
  onSelectCategory,
}: {
  categoryList: Category[];
  selectedCategoryId: string;
  isArchivedView: boolean;
  // The chosen building and site class, shown as the "Current scope"
  buildingClassName: string;
  siteClassName: string;
  onSelectCategory: (categoryId: string) => void;
}) {
  const allEntry = categoryList.find(
    (category) => category.categoryId === ALL_CATEGORIES_ID,
  );
  const total =
    allEntry?.numberOfRecipes ??
    categoryList.reduce((sum, category) => sum + category.numberOfRecipes, 0);
  const selected = categoryList.find(
    (category) => category.categoryId === selectedCategoryId,
  );

  return (
    <aside className="panel flex min-h-0 min-w-0 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Browse</p>
          <h2 className="mt-1 text-[16px] font-bold tracking-[-0.02em]">
            Categories
          </h2>
        </div>
        <span className="rounded-lg bg-[#F5F3EF] px-2 py-1 text-[10px] font-bold uppercase text-[#78716C]">
          {total} total
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-[#EFECE6] bg-[#FAF9F7] px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A8A29E]">
          Current scope
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#57534E]">
          <span>{buildingClassName}</span>
          <span className="text-[#D6D3D1]">•</span>
          <span className="truncate">{siteClassName}</span>
        </div>
      </div>

      <nav className="mt-4 space-y-1.5" aria-label="Recipe categories">
        {categoryList.length > 0
          ? categoryList.map((category) => {
              const isActive = category.categoryId === selectedCategoryId;
              const isAll = category.categoryId === ALL_CATEGORIES_ID;
              return (
                <button
                  key={category.categoryId}
                  onClick={() => onSelectCategory(category.categoryId)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] transition ${
                    isActive
                      ? "bg-[#FFF1E7] font-bold text-[#E95333]"
                      : "font-semibold text-[#57534E] hover:bg-[#F8F6F2]"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-white text-[#FF6B4A]"
                        : "bg-[#F5F3EF] text-[#A8A29E]"
                    }`}
                  >
                    {isAll ? (
                      <MdOutlineLayers size={15} />
                    ) : (
                      <MdOutlineCategory size={15} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {category.categoryName}
                  </span>
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] ${
                      isActive
                        ? "bg-white text-[#FF6B4A]"
                        : "bg-[#F5F3EF] text-[#A8A29E]"
                    }`}
                  >
                    {category.numberOfRecipes}
                  </span>
                </button>
              );
            })
          : Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 w-full animate-pulse rounded-xl bg-[#F5F3EF]"
              />
            ))}
      </nav>

      <div className="mt-auto border-t border-[#F0EDE8] pt-4">
        <p className="mt-4 text-[10px] leading-[1.55] text-[#A8A29E]">
          Showing{" "}
          <strong className="font-semibold text-[#78716C]">
            {isArchivedView ? "archived" : "active"}
          </strong>{" "}
          recipes in{" "}
          <strong className="font-semibold text-[#78716C]">
            {selected?.categoryName ?? "all categories"}
          </strong>
          .
        </p>
      </div>
    </aside>
  );
}