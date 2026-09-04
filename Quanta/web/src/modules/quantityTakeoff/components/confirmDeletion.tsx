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

export type LineItemId = {
  id: string;
};

export function ConfirmDeletionModal({
  deletedLineItemsList,
  showDeleteModal,
  billOfQuantsUpdater,
  message,
  header,
  openClose,
}: {
  billOfQuantsUpdater: (something: any) => void;
  header: string;
  deletedLineItemsList: LineItemId[];
  message: string;
  openClose: (show: boolean) => void;
  showDeleteModal: boolean;
}) {
  const [showDeletingItems, setShowDeletingItems] = useState<boolean>(false);
  const globalErrorMessage = globalErrorState(
    (state: any) => state.globalErrorMessage,
  );

  async function deleteFiles() {
    // close modal
    setShowDeletingItems(true);
    // run up an api
    const response = await deleteLineItem({
      companyId: "seed-company-001",
      projectId: "seed-proj-001",
      lineItems: deletedLineItemsList,
    });

    if (response.length == 0) {
      return;
    }

    for (const eachDeletedItem of response) {
      billOfQuantsUpdater((prev: GetBillOfQuantsResponse[]) => {
        prev.filter((lineItem) => lineItem.id == eachDeletedItem.id);
      });
    }

    openClose(false);
    setShowDeletingItems(false);
  }

  function closeModal() {
    openClose(false);
  }

  return (
    <>
      <AlertDialog
        open={!showDeletingItems}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{header}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => closeModal()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => await deleteFiles()}
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
