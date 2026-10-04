import { useState } from "react";
import { deleteLineItem } from "@/modules/quantityTakeoff/api/services";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
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
  companyId,
  projectId,
  deletedLineItemsList,
  billOfQuantsUpdater,
  message,
  header,
  openClose,
}: {
  companyId: string;
  projectId: string;
  billOfQuantsUpdater: (something: any) => void;
  header: string;
  deletedLineItemsList: LineItemId[];
  message: string;
  openClose: (show: boolean) => void;
}) {
  const [showDeletingItems, setShowDeletingItems] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function deleteFiles() {
    setErrorMessage(null);
    setShowDeletingItems(true);

    try {
      const response = await deleteLineItem({
        companyId,
        projectId,
        lineItems: deletedLineItemsList,
      });

      if (response.length === 0) {
        setErrorMessage("Nothing was deleted. Try again.");
        return;
      }

      const deletedIds = new Set(response.map((item) => item.id));
      billOfQuantsUpdater((prev: GetBillOfQuantsResponse[]) =>
        prev.filter((lineItem) => !deletedIds.has(lineItem.id)),
      );

      openClose(false);
    } catch {
      setErrorMessage("Couldn't delete these items. Try again.");
    } finally {
      setShowDeletingItems(false);
    }
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
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => closeModal()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await deleteFiles();
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