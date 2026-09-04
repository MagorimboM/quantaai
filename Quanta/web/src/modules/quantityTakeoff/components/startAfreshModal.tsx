import { useState } from "react";
import { deleteLineItem } from "@/modules/quantityTakeoff/api/services";
import { globalErrorState } from "@/common/storage/globalState";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.request";
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
import { NfcIcon } from "lucide-react";

export type LineItemId = {
  id: string;
};

export function StartAfreshModalConfirmation({
  billOfQuantsUpdater,
  showModal,
  openCloseModal,
}: {
  billOfQuantsUpdater: (something?: any) => void;
  showModal: boolean;
  openCloseModal: () => void;
}) {
  // Own local state for the confirm <-> deleting toggle, same pattern as
  // ConfirmDeletionModal. `showModal` only controls whether this component
  // exists at all (the parent's job) -- it can't ALSO mean "currently
  // deleting", those are two different questions.
  const [showDeletingItems, setShowDeletingItems] = useState<boolean>(false);

  async function clearAllTakeOffItemsOfProject() {
    setShowDeletingItems(true);

    const response = await deleteProjectBillOfQuantities({
      companyId: "seed-company-001",
      projectId: "seed-proj-001",
    });

    if (response.deletedItems == 0) {
      // Nothing was deleted -- go back to the confirm view instead of
      // leaving the user staring at a spinner with no way out.
      setShowDeletingItems(false);
      return;
    }

    // clear the stuff
    billOfQuantsUpdater([]);

    // close the modal
    openCloseModal();
    setShowDeletingItems(false);
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
            <AlertDialogTitle>Start Project Afresh</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restart the project? This means all take
              off will be deleted <br /> and action cannot be reversed
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => openCloseModal()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearAllTakeOffItemsOfProject()}
              className=" cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
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