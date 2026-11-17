import type { RecipeOption } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import {
  calculateTotal,
  formatQuantity,
  formatRate,
} from "@/modules/quantityTakeoff/components/takeOff.utils";

type Row = { id: string; name: string; unit: string; quantity: number };

// Everything a recipe contains, shown before it is added so the user knows
// exactly what the takeoff line will bring with it.
//
// A recipe stores quantities per 1 unit (for example per 1 m² of wall). When
// the user has typed a measurement, "For this job" shows each quantity
// multiplied by it, which is the same maths the takeoff line will use.
export function RecipePreview({
  recipe,
  measurement,
}: {
  recipe: RecipeOption;
  // null until the user types a valid measurement
  measurement: number | null;
}) {
  const groups: { label: string; rows: Row[] }[] = [
    {
      label: "Materials",
      rows: recipe.recipeMaterials.map((m) => ({
        id: m.id,
        name: m.material.name,
        unit: m.unit,
        quantity: m.quantity,
      })),
    },
    {
      label: "Labour",
      rows: recipe.recipeLabour.map((l) => ({
        id: l.id,
        name: l.labour.name,
        unit: l.unit,
        quantity: l.quantity,
      })),
    },
    {
      label: "Overheads",
      rows: recipe.recipeOverheads.map((o) => ({
        id: o.id,
        name: o.overhead.name,
        unit: o.unit,
        quantity: o.quantity,
      })),
    },
  ].filter((group) => group.rows.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[#1C1917]">
            {recipe.name}
          </h2>
          <span className="rounded-lg bg-[#F5F5F4] px-2 py-0.5 text-xs text-[#78716C]">
            {recipe.category.name}
          </span>
        </div>
        {recipe.description ? (
          <p className="text-sm leading-relaxed text-[#44403C]">
            {recipe.description}
          </p>
        ) : null}
        <p className="text-xs text-[#78716C]">
          Quantities below are per 1 {recipe.unit}.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#F0EDE8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F0EDE8] bg-[#FAFAF9] text-xs text-[#78716C]">
              <th className="px-3 py-2 text-left font-normal">Component</th>
              <th className="w-16 text-left font-normal">Unit</th>
              <th className="w-24 text-right font-normal">
                Per {recipe.unit}
              </th>
              <th className="w-28 px-3 text-right font-normal">For this job</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <GroupRows
                key={group.label}
                label={group.label}
                rows={group.rows}
                measurement={measurement}
              />
            ))}
          </tbody>
        </table>
        {measurement === null ? (
          <p className="border-t border-[#F0EDE8] px-3 py-2 text-xs text-[#78716C]">
            Enter a measurement below to see the totals for this job.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function GroupRows({
  label,
  rows,
  measurement,
}: {
  label: string;
  rows: Row[];
  measurement: number | null;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={4}
          className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-[#78716C]"
        >
          {label}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id}>
          <td className="px-3 py-1 text-[#1C1917]">{row.name}</td>
          <td className="text-[#78716C]">{row.unit}</td>
          <td className="text-right tabular-nums text-[#78716C]">
            {formatRate(row.quantity)}
          </td>
          <td className="px-3 text-right font-medium tabular-nums text-[#1C1917]">
            {measurement === null
              ? "—"
              : formatQuantity(
                  calculateTotal(row.quantity, measurement),
                  row.unit,
                )}
          </td>
        </tr>
      ))}
    </>
  );
}