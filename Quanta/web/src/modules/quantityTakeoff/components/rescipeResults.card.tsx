import { MdCheck, MdOutlineLayers } from "react-icons/md";
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
      className={`relative flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-all ${
        isSelected
          ? "border-[#FF7B5E] bg-[#FFF7ED] shadow-[0_7px_18px_rgba(255,107,74,0.09)]"
          : "border-[#EEEAE5] bg-white hover:-translate-y-px hover:border-[#DDD6CF]"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] ${
          isSelected
            ? "bg-[#FFE5D9] text-[#D75438]"
            : "bg-[#F4F1ED] text-[#81776F]"
        }`}
      >
        <MdOutlineLayers size={19} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold leading-snug text-[#1C1917]">
            {recipe.name}
          </span>
          <span className="shrink-0 rounded-md border border-[#E9E4DE] bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold text-[#847C75]">
            {recipe.unit}
          </span>
        </span>

        <span className="text-xs text-[#78716C]">
          <b className="font-semibold text-[#716963]">{recipe.category.name}</b>
          {recipe.description ? ` · ${recipe.description}` : ""}
        </span>

        <span className="text-[11px] text-[#A8A29E]">
          {recipe.recipeMaterials.length} materials ·{" "}
          {recipe.recipeLabour.length} labour · {recipe.recipeOverheads.length}{" "}
          overheads
        </span>
      </span>

      {isSelected ? (
        <span className="absolute right-2.5 bottom-2.5 flex size-5 items-center justify-center rounded-full bg-[#FF6B4A] text-white">
          <MdCheck size={13} />
        </span>
      ) : null}
    </button>
  );
}