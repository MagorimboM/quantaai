function Skel({ className = "" }: { className?: string }) {
  return <div className={`bg-[#F0EDE8] rounded animate-pulse ${className}`} />;
}

export function SkeletonCompanyCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#F0EDE8] bg-white p-4">
      <Skel className="h-10 w-10 flex-shrink-0 rounded-[9px]" />
      <div className="flex-1 space-y-2.5">
        <Skel className="h-2.5 w-2/5" />
        <Skel className="h-2 w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonPersonalCard() {
  return (
    <div className="space-y-5 rounded-xl border border-[#F0EDE8] bg-white p-6">
      <Skel className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skel className="h-3.5 w-2/5" />
        <Skel className="h-2.5 w-1/3" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skel className="h-9" />
        <Skel className="h-9" />
      </div>
    </div>
  );
}

export function SkeletonProjectRow() {
  return (
    <div className="flex min-h-16 items-center gap-3 border-b border-[#F0EDE8] px-1 py-3">
      <div className="flex-1 space-y-2">
        <Skel className="h-2.5 w-3/5" />
        <Skel className="h-2 w-2/5" />
      </div>
      <Skel className="h-2 w-10 flex-shrink-0" />
    </div>
  );
}