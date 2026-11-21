import { MdOutlineArrowRightAlt, MdOutlineLayers, MdOutlineSearch } from "react-icons/md";
import type { Recipe } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// The recipes of the current page as selectable cards, a placeholder while they
// load, or a message when there are none. Clicking a card only selects it; the
// detail panel beside the list shows it and holds its edit, archive and delete
// actions.
export function RecipeList({
  recipeList,
  isLoading,
  isArchivedView,
  selectedRecipeId,
  onSelectRecipe,
}: {
  recipeList: Recipe[];
  isLoading: boolean;
  isArchivedView: boolean;
  selectedRecipeId: string | null;
  onSelectRecipe: (recipeId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-[#EFECE6] bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-1/4 rounded-md bg-[#F5F3EF]" />
              <div className="h-5 w-12 rounded-md bg-[#F5F3EF]" />
            </div>
            <div className="mt-3 h-4 w-2/3 rounded bg-[#F5F3EF]" />
            <div className="mt-2 h-3 w-5/6 rounded bg-[#F5F3EF]" />
            <div className="mt-4 h-3 w-1/4 rounded bg-[#F5F3EF]" />
          </div>
        ))}
      </div>
    );
  }

  if (recipeList.length === 0) {
    return (
      <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DED9D1] bg-[#FCFBF9] text-center">
        <MdOutlineSearch size={24} className="text-[#C7C2BB]" />
        <p className="mt-3 text-[12px] font-bold">
          {isArchivedView ? "No archived recipes" : "No matching recipes"}
        </p>
        <p className="mt-1 text-[11px] text-[#A8A29E]">
          {isArchivedView
            ? "Recipes you archive appear here."
            : "Try a different search term or category."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {recipeList.map((recipe) => {
        const active = recipe.recipeId === selectedRecipeId;
        const count = recipe.recipeMaterials.length;
        return (
          <button
            key={recipe.recipeId}
            type="button"
            onClick={() => onSelectRecipe(recipe.recipeId)}
            aria-pressed={active}
            className={`w-full rounded-2xl border p-4 text-left transition-all ${
              active
                ? "border-[#FF6B4A] bg-[#FFF7ED] shadow-[0_5px_16px_rgba(255,107,74,0.08)]"
                : "border-[#EFECE6] bg-white hover:border-[#DDD6CE] hover:shadow-[0_5px_15px_rgba(49,38,24,0.045)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`max-w-[65%] truncate rounded-md px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${
                  active
                    ? "bg-[#FFE2D5] text-[#E95333]"
                    : "bg-[#F5F3EF] text-[#78716C]"
                }`}
              >
                {recipe.categoryName}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#78716C]">
                <span className="text-[#A8A29E]">Unit</span>
                <span className="rounded-md border border-[#E7E3DC] bg-white px-2 py-1 text-[#44403C]">
                  {recipe.recipeUnit}
                </span>
              </span>
            </div>

            <h3 className="mt-2.5 pr-2 text-[13px] font-bold leading-[1.35] tracking-[-0.01em] text-[#292524]">
              {recipe.recipeName}
            </h3>
            {recipe.recipeDescription ? (
              <p className="mt-1.5 truncate text-[10.5px] text-[#78716C]">
                {recipe.recipeDescription}
              </p>
            ) : null}

            <div className="mt-3 flex items-center justify-between border-t border-[#EDE8E1] pt-2.5">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#78716C]">
                <MdOutlineLayers size={14} className="text-[#A8A29E]" />
                {count} component{count === 1 ? "" : "s"}
              </span>
              <span
                className={`flex items-center gap-1 text-[10px] font-bold ${
                  active ? "text-[#FF6B4A]" : "text-[#A8A29E]"
                }`}
              >
                View recipe <MdOutlineArrowRightAlt size={14} />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}