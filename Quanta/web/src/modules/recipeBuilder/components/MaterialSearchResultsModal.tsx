type MaterialResult = {
  id: string;
  name: string;
  unit: string;
};

export function MaterialSearchResultsModal({
  show,
  results,
  onClose,
  onAdd,
}: {
  show: boolean;
  results: MaterialResult[];
  onClose: () => void;
  onAdd: (material: MaterialResult) => void;
}) {
  if (show === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex max-h-[70vh] w-full max-w-md flex-col gap-3 overflow-hidden rounded-lg bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Search results
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-black transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {results.length > 0 ? (
            results.map((material, key) => (
              <button
                key={key}
                onClick={() => onAdd(material)}
                title="add-material"
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-left transition-colors hover:border-zinc-400"
              >
                <span className="text-sm text-zinc-800">{material.name}</span>
                <span className="text-[10px] font-mono text-zinc-400">{material.unit}</span>
              </button>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-zinc-400">No materials found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
