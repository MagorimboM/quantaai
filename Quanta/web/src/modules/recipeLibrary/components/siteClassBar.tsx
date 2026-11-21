import type { SiteClassItem } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// AS 2870 order, least reactive to most, then problem sites. Classes with other
// names go after these, alphabetically.
const SITE_CLASS_ORDER = ["a", "s", "m", "h1", "h2", "e", "p"];

// "Class H1" and "H1" both sort as "h1"
function orderOf(name: string): number {
  const code = name.trim().toLowerCase().replace(/^class\s+/, "");
  const index = SITE_CLASS_ORDER.indexOf(code);
  return index === -1 ? SITE_CLASS_ORDER.length : index;
}

// Step 2: the warm strip of site / soil classes, from the backend. "All sites"
// comes first. The chosen pill is solid coral with white text; the others show
// their soil type in grey after the name.
export function SiteClassBar({
  options,
  allId,
  selectedId,
  onSelect,
}: {
  options: SiteClassItem[];
  // the id the backend reads as "every site class"
  allId: string;
  selectedId: string;
  onSelect: (siteClassId: string) => void;
}) {
  const pills = [
    { id: allId, name: "All sites", detail: "" },
    ...[...options]
      .sort(
        (a, b) =>
          orderOf(a.siteClassName) - orderOf(b.siteClassName) ||
          a.siteClassName.localeCompare(b.siteClassName),
      )
      .map((item) => ({
        id: item.siteClassId,
        name: item.siteClassName,
        detail: item.siteClassDescription,
      })),
  ];

  return (
    <section
      className="mt-4 shrink-0 rounded-2xl border border-[#F4E9DC] bg-[#FFFBF5] px-5 py-3.5"
      aria-label="Site class"
    >
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <span className="step-number">2</span>
          <span className="text-[12px] font-bold text-[#57534E]">Site Class:</span>
        </div>
        <div className="h-5 w-px bg-[#EBE4DA]" />
        <div className="flex flex-wrap gap-2">
          {pills.map((item) => {
            const active = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={active}
                title={item.detail || undefined}
                className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                  active
                    ? "bg-[#FF6B4A] text-white shadow-[0_3px_8px_rgba(255,107,74,0.22)]"
                    : "border border-[#ECE6DE] bg-white text-[#57534E] hover:border-[#FFB6A5]"
                }`}
              >
                {item.name}
                {item.detail ? (
                  <span className={active ? "text-white/75" : "text-[#A8A29E]"}>
                    {" "}
                    · {item.detail}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}