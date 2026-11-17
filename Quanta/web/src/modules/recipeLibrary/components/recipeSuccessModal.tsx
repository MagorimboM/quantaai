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
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#1C1917]/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#F0EDE8] bg-white p-6 text-[#1C1917] shadow-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4EE] text-[#FF6B35]">
          <Check size={18} />
        </div>
        <p className="text-sm font-medium text-[#1C1917]">Recipe created</p>
        <button
          onClick={onClose}
          className="rounded-lg bg-[#FF6B35] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#E85A26] cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}