import { MdClose } from "react-icons/md";
import {
  COMPONENT_SECTIONS,
  SECTION_LABEL,
  type ComponentSection,
} from "@/modules/quantityTakeoff/components/recipeComponents";

export type RecipeComponentRow = {
  section: ComponentSection;
  itemId: string;
  name: string;
  unit: string;
  quantity: string;
};

// What the recipe is made of so far, grouped by section, with the quantity
// 1 unit of the recipe needs. The unit shown is the item's own unit.
export function RecipeComponentList({
  rows,
  recipeUnit,
  onQuantityChange,
  onRemove,
}: {
  rows: RecipeComponentRow[];
  recipeUnit: string;
  onQuantityChange: (
    section: ComponentSection,
    itemId: string,
    quantity: string,
  ) => void;
  onRemove: (section: ComponentSection, itemId: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
          In this recipe
        </span>
        <span className="text-xs text-[#78716C]">
          Quantity per 1 {recipeUnit || "unit"}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-[#F0EDE8] bg-white">
        {rows.length === 0 ? (
          <p className="flex h-full items-center justify-center p-4 text-center text-sm text-[#78716C]">
            Nothing added yet. Search above and press Add.
          </p>
        ) : (
          COMPONENT_SECTIONS.map((section) => {
            const sectionRows = rows.filter((row) => row.section === section);
            if (sectionRows.length === 0) return null;
            return (
              <div key={section}>
                <div className="px-3 pb-0.5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[#FF6B35]">
                  {SECTION_LABEL[section]}
                </div>
                {sectionRows.map((row) => (
                  <div
                    key={row.itemId}
                    className="flex items-center gap-2 px-3 py-1.5"
                  >
                    <span className="flex-1 text-sm text-[#1C1917]">
                      {row.name}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      aria-label={`Quantity of ${row.name}`}
                      value={row.quantity}
                      onChange={(e) =>
                        onQuantityChange(section, row.itemId, e.target.value)
                      }
                      className="h-7.5 w-19 rounded-lg border border-[#F0EDE8] bg-[#FAFAF9] px-2 text-right text-sm text-[#1C1917] outline-none transition-colors hover:border-[#FFD9C9] focus:border-[#FF6B35] focus:bg-white focus:ring-[3px] focus:ring-[#FFF4EE]"
                    />
                    <span className="w-11 text-xs text-[#78716C]">
                      {row.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(section, row.itemId)}
                      aria-label={`Remove ${row.name}`}
                      className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#A8A29E] transition-colors hover:bg-[#FFF4EE] hover:text-red-600"
                    >
                      <MdClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}