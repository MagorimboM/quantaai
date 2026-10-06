// Full-screen "please wait" shown while Clerk is working, so the person can't
// click around mid-request. One component for both pages; only the message differs.
export function AuthLoadingModal({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-foreground" />
        </div>
        <p className="font-mono text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}