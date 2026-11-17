import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { LoadingModal } from "@/modules/quantityTakeoff/components/loadingModal";

/**
 * "Are you sure?" before anything is deleted. It only asks and reports: what
 * actually happens on Confirm is `onConfirm`, supplied by the page (delete a
 * line item, or clear the whole takeoff). While that runs a "Deleting" overlay
 * shows. If `onConfirm` throws, the dialog stays open with an error so the
 * person can try again; if it finishes, the dialog closes itself.
 */
export function ConfirmDeletionModal({
  header,
  message,
  onConfirm,
  onClose,
}: {
  header: string;
  message: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function confirm() {
    setErrorMessage(null);
    setIsWorking(true);

    try {
      await onConfirm();
      onClose();
    } catch {
      setErrorMessage("That didn't work. Please try again.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <>
      <AlertDialog
        open={!isWorking}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <AlertDialogContent className="gap-5 rounded-2xl border border-[#F0EDE8] bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-[#1C1917]">
              {header}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#78716C]">
              {message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer rounded-lg border border-[#F0EDE8] bg-white text-[#1C1917] transition-colors hover:border-[#FFD9C9] hover:bg-[#FFF4EE]"
              onClick={onClose}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // keep the dialog open until onConfirm has finished
                e.preventDefault();
                confirm();
              }}
              className="cursor-pointer rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LoadingModal show={isWorking} message="Deleting items" />
    </>
  );
}