// Full-screen "please wait" with a message, shown while something is saving,
// deleting or signing in, so the person can't click around mid-request.
// One component for every screen; only the message changes.
export function LoadingModal({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#1C1917]/30 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#F0EDE8] bg-white p-6 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#FF6B35] [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#FF6B35] [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#FF6B35]" />
        </div>
        <p className="text-sm text-[#78716C]">{message}</p>
      </div>
    </div>
  );
}