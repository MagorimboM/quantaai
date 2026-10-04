import { useMemo } from "react";
import { MdClose } from "react-icons/md";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import {
  aggregateQuantities,
  formatQuantity,
  type AggregatedComponent,
} from "@/modules/quantityTakeoff/components/takeOff.utils";

function TotalsGroup({
  label,
  rows,
}: {
  label: string;
  rows: AggregatedComponent[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b last:border-b-0">
              <td className="py-1.5 pr-2 text-foreground">{row.name}</td>
              <td className="w-16 pr-2 text-muted-foreground">{row.unit}</td>
              <td className="w-28 text-right font-medium tabular-nums text-foreground">
                {formatQuantity(row.total, row.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PreviewQuantitiesModal({
  lineItems,
  onClose,
}: {
  lineItems: GetBillOfQuantsResponse[];
  onClose: () => void;
}) {
  const totals = useMemo(() => aggregateQuantities(lineItems), [lineItems]);
  const itemsWithoutRecipe = lineItems.filter((item) => !item.recipe).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-lg border bg-card text-card-foreground shadow-lg"
      >
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Quantities summary
            </h1>
            <p className="text-sm text-muted-foreground">
              Combined totals across all line items
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4">
          <TotalsGroup label="Materials" rows={totals.materials} />
          <TotalsGroup label="Labour" rows={totals.labour} />
          <TotalsGroup label="Overheads" rows={totals.overheads} />

          {itemsWithoutRecipe > 0 ? (
            <p className="text-xs text-muted-foreground">
              {itemsWithoutRecipe} line item{itemsWithoutRecipe === 1 ? " has" : "s have"} no
              recipe and {itemsWithoutRecipe === 1 ? "isn't" : "aren't"} included.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}