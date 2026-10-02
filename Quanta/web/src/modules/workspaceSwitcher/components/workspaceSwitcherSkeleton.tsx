function Skel({ className = "" }: { className?: string }) {
  return <div className={`bg-[#F3DEC0] rounded animate-pulse ${className}`} />;
}

export function SkeletonCompanyCard() {
  return (
    <div className="bg-white border border-[#F3DEC0] rounded-md p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skel className="w-9 h-9 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skel className="h-3.5 w-3/5" />
          <Skel className="h-2.5 w-2/5" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skel className="h-2.5 w-16" />
        <Skel className="h-2.5 w-16" />
      </div>
    </div>
  );
}

export function SkeletonPersonalCard() {
  return (
    <div className="bg-white border border-[#F3DEC0] rounded-md p-6 space-y-5">
      <Skel className="w-12 h-12 rounded-full" />
      <div className="space-y-2">
        <Skel className="h-4 w-2/5" />
        <Skel className="h-3 w-1/3" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skel className="h-10" />
        <Skel className="h-10" />
      </div>
    </div>
  );
}

export function SkeletonProjectRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F3DEC0]">
      <Skel className="w-1.5 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skel className="h-3 w-4/5" />
        <Skel className="h-2.5 w-1/2" />
      </div>
      <Skel className="h-2.5 w-14 flex-shrink-0" />
    </div>
  );
}