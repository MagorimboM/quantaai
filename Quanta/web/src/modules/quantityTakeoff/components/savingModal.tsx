import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

export function SavingBillOfQuantsModal({ show }: { show: boolean }) {
  return (
    <AlertDialog open={show}>
      <AlertDialogContent className="flex flex-col items-center gap-4 rounded-2xl border border-[#F0EDE8] bg-white p-6 text-center shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce" />
        </div>
        <p className="text-sm text-[#78716C]">Saving items</p>
      </AlertDialogContent>
    </AlertDialog>
  );
}