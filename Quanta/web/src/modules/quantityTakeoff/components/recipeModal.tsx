import type { Recipe } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.request";
import { MdOutlineInventory2, MdOutlineEngineering, MdOutlineBuild } from "react-icons/md";

function SectionHeader({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <h1 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          {label}
        </h1>
      </div>
      <span className="text-xs text-muted-foreground">{count} {count === 1 ? "item" : "items"}</span>
    </div>
  );
}

export function RecipeModal({ recipe }: { recipe?: Recipe }) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-row items-baseline gap-2 border-b pb-3">
        <h1 className="text-lg font-semibold text-foreground">{recipe?.name}</h1>
        {recipe?.unit ? (
          <span className="rounded-full border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {recipe.unit}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground">
        <SectionHeader
          icon={<MdOutlineInventory2 size={16} />}
          label="Materials"
          count={recipe?.recipeMaterials?.length ?? 0}
        />
        {recipe?.recipeMaterials && recipe.recipeMaterials.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recipe.recipeMaterials.map((material, key) => (
              <div
                key={key}
                className="flex flex-col gap-1 rounded-md border bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
              >
                <h1 className="text-sm font-medium text-foreground">{material.material.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {material.quantity} {material.unit}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No materials added</p>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground">
        <SectionHeader
          icon={<MdOutlineEngineering size={16} />}
          label="Labour"
          count={recipe?.recipeLabour?.length ?? 0}
        />
        {recipe?.recipeLabour && recipe.recipeLabour.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recipe.recipeLabour.map((labour, key) => (
              <div
                key={key}
                className="flex flex-col gap-1 rounded-md border bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
              >
                <h1 className="text-sm font-medium text-foreground">{labour.labour.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {labour.quantity} {labour.unit}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No labour added</p>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground">
        <SectionHeader
          icon={<MdOutlineBuild size={16} />}
          label="Overheads"
          count={recipe?.recipeOverheads?.length ?? 0}
        />
        {recipe?.recipeOverheads && recipe.recipeOverheads.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recipe.recipeOverheads.map((overhead, key) => (
              <div
                key={key}
                className="flex flex-col gap-1 rounded-md border bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
              >
                <h1 className="text-sm font-medium text-foreground">{overhead.overhead.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {overhead.quantity} {overhead.unit}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No overheads added</p>
        )}
      </div>
    </div>
  );
}