import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

export function SavingBillOfQuantsModal({ show }: { show: boolean }) {
  return (
    <AlertDialog open={show}>
      <AlertDialogContent className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-foreground animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-foreground animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-foreground animate-bounce" />
        </div>
        <p className="text-sm text-muted-foreground">Saving items</p>
      </AlertDialogContent>
    </AlertDialog>
  );
}