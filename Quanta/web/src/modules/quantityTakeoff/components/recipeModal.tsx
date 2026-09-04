import type { Recipe } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.request";

export function RecipeModal({ recipe }: { recipe?: Recipe }) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-6 justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{recipe?.name}</h1>
        </div>
        <div className="flex flex-col flex-1 p-6 gap-2 rounded-lg border bg-card text-card-foreground">
          <h1 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Materials</h1>
          <div className="  grid-cols-4 flex flex-1 flex-row gap-2 p-2">
            {recipe?.recipeMaterials.map((material, key) => (
              <div
                key={key}
                className="bg-muted border rounded-lg p-2 gap-2 flex flex-col"
              >
                <h1 className="text-sm font-medium text-foreground">{material.material.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {material.quantity} {material.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-1 p-6 gap-2 rounded-lg border bg-card text-card-foreground">
          <h1 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Labour</h1>
          <div className="flex flex-row gap-2 p-2">
            {recipe?.recipeLabour.map((labour, key) => (
              <div
                key={key}
                className="bg-muted border rounded-lg p-2 gap-2 flex flex-col"
              >
                <h1 className="text-sm font-medium text-foreground">{labour.labour.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {labour.quantity} {labour.unit}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-6 gap-2 rounded-lg border bg-card text-card-foreground">
          <h1 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Overheads</h1>
          <div className="flex flex-1 flex-row gap-2 p-2">
            {recipe?.recipeOverheads.map((overhead, key) => (
              <div
                key={key}
                className="bg-muted border rounded-lg p-2 gap-2 flex flex-col"
              >
                <h1 className="text-sm font-medium text-foreground">{overhead.overhead.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {overhead.quantity} {overhead.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}