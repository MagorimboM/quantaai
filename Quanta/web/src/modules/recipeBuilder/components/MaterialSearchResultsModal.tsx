import { X } from "lucide-react";
import type { MaterialSearchResult } from "@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts";

// The materials the search found. Clicking one adds it to the recipe; the list
// stays open so several can be added in a row, and ones already in the recipe
// are marked "Added" so they can't be added twice.
export function MaterialSearchResultsModal({
  show,
  results,
  addedIds,
  onClose,
  onAdd,
}: {
  show: boolean;
  results: MaterialSearchResult[];
  addedIds: string[];
  onClose: () => void;
  onAdd: (material: MaterialSearchResult) => void;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex max-h-[70vh] w-full max-w-md flex-col gap-3 overflow-hidden rounded-lg border bg-card p-5 text-card-foreground shadow-lg">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Search results
          </h2>
          <button
            onClick={onClose}
            aria-label="Close search results"
            className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {results.length > 0 ? (
            results.map((material) => {
              const added = addedIds.includes(material.id);
              return (
                <button
                  key={material.id}
                  onClick={() => onAdd(material)}
                  disabled={added}
                  title="add-material"
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-left transition-colors hover:border-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-sm text-foreground">{material.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {added ? "Added" : material.unit}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No materials found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}