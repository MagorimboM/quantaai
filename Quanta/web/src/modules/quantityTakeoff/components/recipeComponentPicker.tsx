import { MdAdd, MdOutlineSearch } from "react-icons/md";
import type { CatalogueItem } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import {
  COMPONENT_SECTIONS,
  SECTION_KIND,
  SECTION_LABEL,
  type ComponentSection,
} from "@/modules/quantityTakeoff/components/recipeComponents";

// Search the catalogue and add materials, labour or overheads to the recipe.
//
// The "Create new ..." row is pinned under the results and is always there,
// with or without matches, so a missing item can be created without hunting
// for a button. When nothing matches, the same action is offered again, filled
// in from what was typed.
export function RecipeComponentPicker({
  section,
  query,
  items,
  addedIds,
  addedCounts,
  onSectionChange,
  onQueryChange,
  onAdd,
  onCreate,
}: {
  section: ComponentSection;
  query: string;
  // Every catalogue item of this section; filtered here by the query
  items: CatalogueItem[];
  addedIds: string[];
  addedCounts: Record<ComponentSection, number>;
  onSectionChange: (section: ComponentSection) => void;
  onQueryChange: (query: string) => void;
  onAdd: (itemId: string) => void;
  // `name` is what was typed, so the create form can start with it
  onCreate: (name: string) => void;
}) {
  const term = query.trim().toLowerCase();
  const results = items.filter(
    (item) => !term || item.name.toLowerCase().includes(term),
  );
  const word = SECTION_KIND[section];
  const typed = query.trim();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-1.5">
        {COMPONENT_SECTIONS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSectionChange(key)}
            className={`h-8 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors ${
              section === key
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-secondary-foreground hover:bg-muted/40"
            }`}
          >
            {SECTION_LABEL[key]}{" "}
            <span className="ml-1 text-[11px] opacity-75">
              {addedCounts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-2.5 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
        <MdOutlineSearch size={18} className="text-muted-foreground" />
        <input
          type="text"
          aria-label="Search the catalogue"
          placeholder={`Search ${SECTION_LABEL[section].toLowerCase()}…`}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex h-47.5 shrink-0 flex-col overflow-hidden rounded-lg border bg-card">
        <div className="min-h-0 flex-1 overflow-y-auto">
          {results.length > 0 ? (
            results.map((item) => {
              const isAdded = addedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 border-b border-secondary px-3 py-1.75"
                >
                  <span className="flex-1 text-sm text-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.unit}
                  </span>
                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => onAdd(item.id)}
                    className={`h-7 rounded-md border px-3 text-xs font-medium transition-colors ${
                      isAdded
                        ? "border-border bg-background text-muted-foreground"
                        : "cursor-pointer border-primary bg-card text-primary hover:bg-secondary"
                    }`}
                  >
                    {isAdded ? "Added" : "Add"}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2.5 p-4 text-center">
              <p className="text-sm leading-relaxed text-secondary-foreground">
                {typed
                  ? `No ${SECTION_LABEL[section].toLowerCase()} match “${typed}”.`
                  : `There are no ${SECTION_LABEL[section].toLowerCase()} in your catalogue yet.`}
              </p>
              <button
                type="button"
                onClick={() => onCreate(typed)}
                className="h-8.5 cursor-pointer rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {typed ? `Create “${typed}” as a new ${word}` : `Create new ${word}`}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onCreate(typed)}
          className="flex h-9.5 shrink-0 cursor-pointer items-center gap-2 border-t bg-background px-3 text-left text-sm font-medium text-primary transition-colors hover:bg-secondary"
        >
          <MdAdd size={16} />
          Create new {word}
        </button>
      </div>
    </div>
  );
}