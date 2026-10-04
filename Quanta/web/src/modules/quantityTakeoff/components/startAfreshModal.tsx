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

import { deleteProjectBillOfQuantities } from "@/modules/quantityTakeoff/api/services";

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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start project afresh</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restart the project? All takeoff will be
              deleted and this action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => openCloseModal()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                clearAllTakeOffItemsOfProject();
              }}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeletingItems}>
        <AlertDialogContent className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-foreground animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-foreground animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-foreground animate-bounce" />
          </div>
          <p className="text-sm text-muted-foreground">Deleting items</p>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}