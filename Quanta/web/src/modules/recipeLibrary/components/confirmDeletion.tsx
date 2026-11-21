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
import { LoadingModal } from "@/common/components/loadingModal";

/**
 * "Are you sure?" before anything is deleted. It only asks and reports: what
 * actually happens on Confirm is `onConfirm`, supplied by the screen that
 * opened it. While that runs, a "working" overlay shows. If `onConfirm` throws,
 * the dialog stays open and shows the error's message (so the reason, such as
 * "this recipe is used by a takeoff", reaches the person); if it finishes, the
 * dialog closes itself.
 */
export function ConfirmDeletionModal({
  header,
  message,
  workingMessage = "Deleting items",
  onConfirm,
  onClose,
}: {
  header: string;
  message: string;
  workingMessage?: string;
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
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "That didn't work. Please try again.",
      );
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
        <AlertDialogContent className="gap-5 rounded-2xl border border-[#EFECE6] bg-white p-6 shadow-[0_25px_70px_rgba(40,29,23,0.25)]">
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
              className="cursor-pointer rounded-lg border border-[#E7E2DC] bg-white text-[#746C66] transition-colors hover:border-[#FFC6B5] hover:bg-[#FFF6F1]"
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

      <LoadingModal show={isWorking} message={workingMessage} />
    </>
  );
}