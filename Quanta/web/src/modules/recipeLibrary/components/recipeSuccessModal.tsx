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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#EFECE6] bg-white p-6 text-[#1C1917] shadow-[0_25px_70px_rgba(40,29,23,0.25)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]">
          <Check size={18} />
        </div>
        <p className="text-sm font-semibold text-[#1C1917]">Recipe created</p>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-lg bg-[#FF6B4A] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(255,107,74,0.22)] transition-colors hover:bg-[#F25C3C]"
        >
          Done
        </button>
      </div>
    </div>
  );
}