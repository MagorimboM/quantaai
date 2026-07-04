import { Loader2 } from "lucide-react";

export function DeletingComp({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="w-1/4 min-w-[280px] flex flex-col items-center gap-4 bg-white rounded-2xl border-2 p-6 shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        <div className="text-center text-gray-800">{message}</div>
      </div>
    </div>
  );
}
