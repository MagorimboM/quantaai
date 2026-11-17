import type { RecipeOption } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";

// One search result: enough to recognise the recipe at a glance (name,
// category, the first lines of its description, and what it contains).
// Clicking it only previews the recipe; nothing is added to the takeoff yet.
export function RecipeResultCard({
  recipe,
  isSelected,
  onSelect,
}: {
  recipe: RecipeOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex w-full cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors ${
        isSelected
          ? "border-[#FF6B35] bg-[#FFF4EE] ring-[3px] ring-[#FFF4EE]"
          : "border-[#F0EDE8] bg-white hover:border-[#FFD9C9] hover:bg-[#FFF4EE]/50"
      }`}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#1C1917]">
          {recipe.name}
        </span>
        <span className="whitespace-nowrap rounded-full bg-[#FFF4EE] px-2 py-0.5 text-xs text-[#FF6B35]">
          {recipe.category.name}
        </span>
      </span>

      {recipe.description ? (
        <span className="line-clamp-2 text-xs leading-relaxed text-[#78716C]">
          {recipe.description}
        </span>
      ) : null}

      <span className="text-xs text-[#A8A29E]">
        {recipe.recipeMaterials.length} materials ·{" "}
        {recipe.recipeLabour.length} labour · {recipe.recipeOverheads.length}{" "}
        overheads
      </span>
    </button>
  );
}