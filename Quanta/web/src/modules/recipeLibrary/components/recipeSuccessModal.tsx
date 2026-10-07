import { Check } from "lucide-react";

// Confirms the recipe was saved. "Done" closes the builder, which has nothing
// left to do once the recipe exists.
export function RecipeSuccessModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-card-foreground shadow-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check size={16} />
        </div>
        <p className="text-sm font-medium text-foreground">Recipe created</p>
        <button
          onClick={onClose}
          className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}