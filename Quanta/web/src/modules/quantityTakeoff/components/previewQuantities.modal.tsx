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
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#FF6B35]">
        {label}
      </h3>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-[#F0EDE8] last:border-b-0">
              <td className="py-2 pr-2 text-[#1C1917]">{row.name}</td>
              <td className="w-16 pr-2 text-[#78716C]">{row.unit}</td>
              <td className="w-28 text-right font-medium tabular-nums text-[#1C1917]">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-[#F0EDE8] bg-white text-[#1C1917] shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-[#F0EDE8] px-5 py-4">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-[#1C1917]">
              Quantities summary
            </h1>
            <p className="text-sm text-[#78716C]">
              Combined totals across all line items
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-[#A8A29E] transition-colors hover:bg-[#FFF4EE] hover:text-[#1C1917] cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4">
          <TotalsGroup label="Materials" rows={totals.materials} />
          <TotalsGroup label="Labour" rows={totals.labour} />
          <TotalsGroup label="Overheads" rows={totals.overheads} />

          {itemsWithoutRecipe > 0 ? (
            <p className="text-xs text-[#78716C]">
              {itemsWithoutRecipe} line item{itemsWithoutRecipe === 1 ? " has" : "s have"} no
              recipe and {itemsWithoutRecipe === 1 ? "isn't" : "aren't"} included.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}