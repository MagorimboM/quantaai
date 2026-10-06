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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{header}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" onClick={onClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // keep the dialog open until onConfirm has finished
                e.preventDefault();
                confirm();
              }}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
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