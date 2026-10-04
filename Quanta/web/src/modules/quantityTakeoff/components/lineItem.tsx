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

// NOTE :: "Location" in the UI is stored in the line item's existing
// `description` column, so no migration is needed. Rename it later if the
// column name starts to confuse.

export type LineItemPatch = Partial<
  Pick<GetBillOfQuantsResponse, "description" | "measurement" | "notes">
>;

type ComponentRow = { id: string; name: string; unit: string; quantity: number };

const inlineField =
  "h-7 w-full rounded-md border border-transparent bg-transparent px-1.5 text-xs text-foreground placeholder:text-muted-foreground hover:border-border focus-visible:border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

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
          className="pt-3 pb-1 text-xs font-medium text-muted-foreground"
        >
          {label}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id}>
          <td className="py-1 pr-2 text-foreground">{row.name}</td>
          <td className="pr-2 text-muted-foreground">{row.unit}</td>
          <td className="pr-2 text-right tabular-nums text-muted-foreground">
            {formatRate(row.quantity)}
          </td>
          <td className="text-right font-medium tabular-nums text-foreground">
            {formatQuantity(calculateTotal(row.quantity, measurement), row.unit)}
          </td>
        </tr>
      ))}
    </>
  );
}

export function LineItem({
  takeOffLineItem,
  onUpdate,
  onDelete,
}: {
  takeOffLineItem: GetBillOfQuantsResponse;
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
    <div className="border-b last:border-b-0">
      <div className="flex items-start gap-3 px-4 py-3">
        {recipe ? (
          <button
            onClick={() => setShowComponents((prev) => !prev)}
            aria-label="Show or hide components"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <MdOutlineExpandMore
              size={20}
              className={`transition-transform ${showComponents ? "" : "-rotate-90"}`}
            />
          </button>
        ) : (
          <div className="h-8 w-8 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 pt-1 pl-1.5">
            <h2 className="text-sm font-medium text-foreground">
              {recipe?.name ?? "—"}
            </h2>
            {recipe?.category ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {recipe.category.name}
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex items-center gap-1">
            <MdOutlineLocationOn
              size={14}
              className="ml-1.5 shrink-0 text-muted-foreground"
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
              className="ml-1.5 shrink-0 text-muted-foreground"
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

        <div className="flex items-center gap-1.5 pt-0.5">
          <input
            type="number"
            min="0"
            step="any"
            value={measurementText}
            onChange={(e) => handleMeasurementChange(e.target.value)}
            aria-label="Quantity"
            className="h-9 w-24 rounded-md border border-input bg-background px-2 text-right text-sm tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>

        <button
          onClick={() => onDelete(id)}
          aria-label="Delete line item"
          className="mt-0.5 rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <MdDeleteOutline size={18} />
        </button>
      </div>

      {recipe && showComponents ? (
        <div className="px-4 pb-4 pl-[3.75rem]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="py-1 text-left font-normal">Component</th>
                <th className="w-16 text-left font-normal">Unit</th>
                <th className="w-24 text-right font-normal">Per {recipe.unit}</th>
                <th className="w-28 text-right font-normal">Total</th>
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