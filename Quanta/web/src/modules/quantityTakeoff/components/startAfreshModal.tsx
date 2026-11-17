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

import { deleteProjectBillOfQuantities } from "@/modules/quantityTakeoff/api/api";

export function StartAfreshModalConfirmation({
  companyId,
  projectId,
  billOfQuantsUpdater,
  openCloseModal,
}: {
  companyId: string;
  projectId: string;
  billOfQuantsUpdater: (something?: any) => void;
  openCloseModal: () => void;
}) {
  // Whether this component exists at all is the parent's job, so there is no
  // "showModal" prop -- only the confirm <-> deleting toggle lives here.
  const [showDeletingItems, setShowDeletingItems] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function clearAllTakeOffItemsOfProject() {
    setErrorMessage(null);
    setShowDeletingItems(true);

    try {
      const response = await deleteProjectBillOfQuantities({
        companyId,
        projectId,
      });

      if (response.deletedItems == 0) {
        setErrorMessage("Nothing was deleted. Try again.");
        return;
      }

      billOfQuantsUpdater([]);
      openCloseModal();
    } catch {
      setErrorMessage("Couldn't clear the takeoff. Try again.");
    } finally {
      setShowDeletingItems(false);
    }
  }

  return (
    <>
      <AlertDialog
        open={!showDeletingItems}
        onOpenChange={(open) => {
          if (!open) openCloseModal();
        }}
      >
        <AlertDialogContent className="gap-5 rounded-2xl border border-[#F0EDE8] bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-[#1C1917]">
              Start project afresh
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#78716C]">
              Are you sure you want to restart the project? All takeoff will be
              deleted and this action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer rounded-lg border border-[#F0EDE8] bg-white text-[#1C1917] transition-colors hover:border-[#FFD9C9] hover:bg-[#FFF4EE]"
              onClick={() => openCloseModal()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                clearAllTakeOffItemsOfProject();
              }}
              className="cursor-pointer rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeletingItems}>
        <AlertDialogContent className="flex flex-col items-center gap-4 rounded-2xl border border-[#F0EDE8] bg-white p-6 text-center shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce" />
          </div>
          <p className="text-sm text-[#78716C]">Deleting items</p>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}