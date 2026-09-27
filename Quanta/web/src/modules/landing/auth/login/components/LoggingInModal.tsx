export function LoggingInModal({ show }: { show: boolean }) {
  if (show === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-4 rounded-lg p-6 shadow-lg"
        style={{ background: '#FFFFFF', border: '1px solid #F3DEC0' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ background: '#2B1B0E' }} />
          <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ background: '#2B1B0E' }} />
          <span className="h-2 w-2 rounded-full animate-bounce" style={{ background: '#2B1B0E' }} />
        </div>
        <p className="text-sm font-mono" style={{ color: '#9C7B4F' }}>Logging in...</p>
      </div>
    </div>
  );
}