export function RegisterSuccessModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  if (show === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-3 rounded-lg p-6 shadow-lg"
        style={{ background: '#FFFFFF', border: '1px solid #F3DEC0' }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#FF6B35' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5l3.5 3.5L13 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium font-mono" style={{ color: '#2B1B0E' }}>Account created successfully</p>
        <button
          onClick={onClose}
          className="rounded-md px-4 py-1.5 text-xs font-medium font-mono transition-colors cursor-pointer"
          style={{ background: '#FF6B35', color: '#FFFFFF' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#E85A28')}
          onMouseLeave={e => (e.currentTarget.style.background = '#FF6B35')}
        >
          Continue
        </button>
      </div>
    </div>
  );
}