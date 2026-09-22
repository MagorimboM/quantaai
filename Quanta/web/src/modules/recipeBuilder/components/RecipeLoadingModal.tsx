export function RecipeLoadingModal({ show }: { show: boolean }) {
  if (show === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-900 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-zinc-900 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-zinc-900 animate-bounce" />
        </div>
        <p className="text-xs text-zinc-400">Creating your recipe...</p>
      </div>
    </div>
  );
}
