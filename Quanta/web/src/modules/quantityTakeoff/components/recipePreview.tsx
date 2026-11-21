import type { ReactNode } from "react";
import type { RecipeOption } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import {
  calculateTotal,
  formatQuantity,
  formatRate,
} from "@/modules/quantityTakeoff/components/takeOff.utils";
import {
  calculatedBadge,
  kicker,
} from "@/modules/quantityTakeoff/components/takeoff.styles";

type Row = { id: string; name: string; unit: string; quantity: number };

// The calculator column: the recipe's name, then whatever is passed as
// `children` (the measurement card), then everything the recipe contains.
//
// A recipe stores quantities per 1 unit (for example per 1 m² of wall). When
// the user has typed a measurement, "For this job" shows each quantity
// multiplied by it, which is the same maths the takeoff line will use.
export function RecipePreview({
  recipe,
  measurement,
  children,
}: {
  recipe: RecipeOption;
  // null until the user types a valid measurement
  measurement: number | null;
  children?: ReactNode;
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className={kicker}>Quantity calculator</span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#1C1917]">
            {recipe.name}
          </h2>
          <span className="rounded-md border border-[#E9E3DD] bg-[#FAF8F5] px-2 py-0.5 text-xs font-semibold text-[#786D66]">
            {recipe.category.name}
          </span>
        </div>
        {recipe.description ? (
          <p className="text-sm leading-relaxed text-[#78716C]">
            {recipe.description}
          </p>
        ) : null}
      </div>

      {children}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#1C1917]">
              Live components
            </h3>
            <p className="mt-0.5 text-xs text-[#9B938D]">
              Quantities below are per 1 {recipe.unit}.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EEEAE5]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF9F7] text-[11px] font-semibold uppercase tracking-wider text-[#9A938D]">
                <th className="px-3 py-2 text-left">Component</th>
                <th className="w-14 text-left">Unit</th>
                <th className="w-20 text-right">Per {recipe.unit}</th>
                <th className="w-32 px-3 text-right">For this job</th>
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
            <p className="border-t border-[#F0EDE9] px-3 py-2 text-xs text-[#78716C]">
              Enter a measurement above to see the totals for this job.
            </p>
          ) : null}
        </div>
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
          className="border-t border-[#F0EDE9] px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[#FF6B4A]"
        >
          {label}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id}>
          <td className="px-3 py-1.5 text-[#1C1917]">{row.name}</td>
          <td className="text-[#78716C]">{row.unit}</td>
          <td className="text-right tabular-nums text-[#78716C]">
            {formatRate(row.quantity)}
          </td>
          <td className="px-3 text-right">
            {measurement === null ? (
              <span className="text-[#A8A29E]">—</span>
            ) : (
              <span className={calculatedBadge}>
                {formatQuantity(
                  calculateTotal(row.quantity, measurement),
                  row.unit,
                )}
              </span>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}