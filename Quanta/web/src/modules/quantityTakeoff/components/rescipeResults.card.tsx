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
      className={`flex w-full cursor-pointer flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? "border-primary bg-secondary/40 ring-1 ring-primary"
          : "bg-card hover:bg-muted/50"
      }`}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {recipe.name}
        </span>
        <span className="whitespace-nowrap rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {recipe.category.name}
        </span>
      </span>

      {recipe.description ? (
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {recipe.description}
        </span>
      ) : null}

      <span className="text-xs text-muted-foreground">
        {recipe.recipeMaterials.length} materials ·{" "}
        {recipe.recipeLabour.length} labour · {recipe.recipeOverheads.length}{" "}
        overheads
      </span>
    </button>
  );
}