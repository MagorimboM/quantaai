import { useEffect, useState } from "react";
import {
  MdOutlineExpandMore,
  MdOutlineLocationOn,
  MdOutlineStickyNote2,
  MdDeleteOutline,
} from "react-icons/md";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import {
  calculateTotal,
  formatQuantity,
  formatRate,
} from "@/modules/quantityTakeoff/components/takeOff.utils";
import { calculatedBadge } from "@/modules/quantityTakeoff/components/takeoff.styles";

// NOTE :: "Location" in the UI is stored in the line item's existing
// `description` column, so no migration is needed. Rename it later if the
// column name starts to confuse.

export type LineItemPatch = Partial<
  Pick<GetBillOfQuantsResponse, "description" | "measurement" | "notes">
>;

type ComponentRow = { id: string; name: string; unit: string; quantity: number };

const inlineField =
  "h-7 w-full rounded-lg border border-transparent bg-transparent px-1.5 text-xs text-[#1C1917] placeholder:text-[#A8A29E] hover:border-[#FFD1C4] focus-visible:border-[#FF9A81] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FF6B4A]/10";

function ComponentGroup({
  label,
  rows,
  measurement,
}: {
  label: string;
  rows: ComponentRow[];
  measurement: number;
}) {
  if (rows.length === 0) return null;

  return (
    <>
      <tr>
        <td
          colSpan={4}
          className="pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#FF6B4A]"
        >
          {label}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id}>
          <td className="py-1 pr-2 text-[#1C1917]">{row.name}</td>
          <td className="pr-2 text-[#78716C]">{row.unit}</td>
          <td className="pr-2 text-right tabular-nums text-[#78716C]">
            {formatRate(row.quantity)}
          </td>
          <td className="text-right">
            <span className={calculatedBadge}>
              {formatQuantity(calculateTotal(row.quantity, measurement), row.unit)}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

// One line of the takeoff sheet, laid out to fit the narrow right-hand column:
// the name and the quantity share the top row, location and notes sit below.
// `showCategory` is off when the sheet is already grouped by category.
export function LineItem({
  takeOffLineItem,
  showCategory = true,
  onUpdate,
  onDelete,
}: {
  takeOffLineItem: GetBillOfQuantsResponse;
  showCategory?: boolean;
  onUpdate: (id: string, patch: LineItemPatch) => void;
  onDelete: (id: string) => void;
}) {
  const { id, recipe, description, notes, measurement, unit } = takeOffLineItem;

  const [showComponents, setShowComponents] = useState<boolean>(false);

  // The input keeps its own text so clearing the box or typing "40." doesn't
  // fight with the numeric value held in the page's state.
  const [measurementText, setMeasurementText] = useState<string>(
    String(measurement),
  );

  useEffect(() => {
    const parsed = parseFloat(measurementText);
    const shown = Number.isNaN(parsed) ? 0 : parsed;
    if (shown !== measurement) setMeasurementText(String(measurement));
  }, [measurement]);

  function handleMeasurementChange(value: string) {
    setMeasurementText(value);
    const parsed = parseFloat(value);
    onUpdate(id, {
      measurement: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed,
    });
  }

  const materialRows: ComponentRow[] =
    recipe?.recipeMaterials.map((m) => ({
      id: m.id,
      name: m.material.name,
      unit: m.unit,
      quantity: m.quantity,
    })) ?? [];

  const labourRows: ComponentRow[] =
    recipe?.recipeLabour.map((l) => ({
      id: l.id,
      name: l.labour.name,
      unit: l.unit,
      quantity: l.quantity,
    })) ?? [];

  const overheadRows: ComponentRow[] =
    recipe?.recipeOverheads.map((o) => ({
      id: o.id,
      name: o.overhead.name,
      unit: o.unit,
      quantity: o.quantity,
    })) ?? [];

  return (
    <div className="border-b border-[#F0EDE9] last:border-b-0">
      <div className="flex items-start gap-2 px-3 py-3">
        {recipe ? (
          <button
            type="button"
            onClick={() => setShowComponents((prev) => !prev)}
            aria-label="Show or hide components"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#78716C] transition-colors hover:bg-[#FFF4EE] hover:text-[#1C1917]"
          >
            <MdOutlineExpandMore
              size={20}
              className={`transition-transform ${showComponents ? "" : "-rotate-90"}`}
            />
          </button>
        ) : (
          <div className="size-7 shrink-0" />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 pl-1.5">
              <h3 className="truncate text-sm font-semibold text-[#1C1917]">
                {recipe?.name ?? "—"}
              </h3>
              {showCategory && recipe?.category ? (
                <span className="rounded-md bg-[#F5F2EE] px-1.5 py-0.5 text-[11px] text-[#78716C]">
                  {recipe.category.name}
                </span>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <input
                type="number"
                min="0"
                step="any"
                value={measurementText}
                onChange={(e) => handleMeasurementChange(e.target.value)}
                aria-label="Quantity"
                className="h-8 w-20 rounded-lg border border-[#E7E2DC] bg-[#FAF9F7] px-2 text-right text-sm font-medium tabular-nums text-[#1C1917] focus-visible:border-[#FF9A81] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FF6B4A]/10"
              />
              <span className="w-8 text-xs text-[#78716C]">{unit}</span>
              <button
                type="button"
                onClick={() => onDelete(id)}
                aria-label="Delete line item"
                className="cursor-pointer rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <MdDeleteOutline size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <MdOutlineLocationOn
              size={14}
              className="ml-1.5 shrink-0 text-[#A8A29E]"
            />
            <input
              value={description}
              onChange={(e) => onUpdate(id, { description: e.target.value })}
              placeholder="Add location"
              aria-label="Location"
              className={inlineField}
            />
          </div>

          <div className="flex items-center gap-1">
            <MdOutlineStickyNote2
              size={14}
              className="ml-1.5 shrink-0 text-[#A8A29E]"
            />
            <input
              value={notes ?? ""}
              onChange={(e) =>
                onUpdate(id, {
                  notes: e.target.value === "" ? null : e.target.value,
                })
              }
              placeholder="Add notes"
              aria-label="Notes"
              className={inlineField}
            />
          </div>
        </div>
      </div>

      {recipe && showComponents ? (
        <div className="px-3 pb-4 pl-12">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[11px] text-[#9A938D]">
                <th className="py-1 text-left font-medium">Component</th>
                <th className="w-12 text-left font-medium">Unit</th>
                <th className="w-16 text-right font-medium">Per {recipe.unit}</th>
                <th className="w-24 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              <ComponentGroup label="Materials" rows={materialRows} measurement={measurement} />
              <ComponentGroup label="Labour" rows={labourRows} measurement={measurement} />
              <ComponentGroup label="Overheads" rows={overheadRows} measurement={measurement} />
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}