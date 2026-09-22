export function RecipeSuccessModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  if (show === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8.5l3.5 3.5L13 5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-900">Recipe created</p>
        <button
          onClick={onClose}
          className="rounded-md bg-black px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Done
        </button>
      </div>
    </div>
  );
}
