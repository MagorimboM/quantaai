import { MdCheck } from "react-icons/md";
import { BUILDING_CLASSES } from "@/modules/recipeLibrary/contracts/recipeClassification";
import type { BuildingClassItem } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// The tile icon. The backend has no icons, so the glyph comes from the local
// list by matching name (ignoring case); a class with no match shows its
// first letter.
function glyphFor(name: string) {
  const match = BUILDING_CLASSES.find(
    (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  return match?.glyph ?? name.trim().charAt(0).toUpperCase();
}

// Step 1: one tile per building class, from the backend. The chosen one is
// peach with a coral border and a tick.
//
// `counts` maps a building class id to how many live recipes it has. Leave it
// out and the tiles show just the name.
export function BuildingClassSelector({
  options,
  selectedId,
  counts,
  onSelect,
}: {
  options: BuildingClassItem[];
  selectedId: string;
  counts?: Partial<Record<string, number>>;
  onSelect: (buildingClassId: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <section className="mt-6 shrink-0" aria-label="Building class">
      <div className="mb-3 flex items-center gap-2">
        <span className="step-number">1</span>
        <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#57534E]">
          Choose building class
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {options.map((item) => {
          const active = item.buildingClassId === selectedId;
          const count = counts?.[item.buildingClassId];
          return (
            <button
              key={item.buildingClassId}
              type="button"
              onClick={() => onSelect(item.buildingClassId)}
              aria-pressed={active}
              title={item.buildingClassDescription || undefined}
              className={`flex h-[70px] items-center gap-3 rounded-2xl border px-4 text-left transition-all ${
                active
                  ? "border-[#FF6B4A] bg-[#FFF7ED] shadow-[0_5px_18px_rgba(255,107,74,0.09)]"
                  : "border-[#EFECE6] bg-white hover:-translate-y-0.5 hover:border-[#DDD6CE] hover:shadow-[0_6px_18px_rgba(49,38,24,0.05)]"
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[18px] font-semibold ${
                  active
                    ? "bg-white text-[#FF6B4A]"
                    : "bg-[#F8F6F2] text-[#78716C]"
                }`}
              >
                {glyphFor(item.buildingClassName)}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate text-[13px] font-bold ${
                    active ? "text-[#E95333]" : "text-[#292524]"
                  }`}
                >
                  {item.buildingClassName}
                </span>
                {count !== undefined ? (
                  <span className="mt-1 block text-[11px] text-[#A8A29E]">
                    {count} recipe{count === 1 ? "" : "s"}
                  </span>
                ) : null}
              </span>
              {active ? (
                <MdCheck size={16} className="ml-auto shrink-0 text-[#FF6B4A]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}