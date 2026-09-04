import {
  MdOutlineExpandLess,
  MdOutlineExpandMore,
  MdOutlineChangeCircle,
  MdDeleteOutline,
} from "react-icons/md";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import { useState, type Dispatch, type SetStateAction } from "react";

import { RecipeModal } from "@/modules/quantityTakeoff/components/recipeModal";
export type LineItemId = {
  id: string;
};

export function LineItem({
  deletedList,
  takeOffLineItem,
  deletedListUpdater,
  takeOffLineItemsList,
}: {
  deletedList: LineItemId[];
  takeOffLineItem: GetBillOfQuantsResponse;
  takeOffLineItemsList: GetBillOfQuantsResponse[];
  deletedListUpdater: Dispatch<SetStateAction<LineItemId[]>>;
}) {
  const [showRecipeItems, setShowRecipeItems] = useState<boolean>(false);

  function addToOrRemoveFromDeleteList(lineItem: GetBillOfQuantsResponse) {
    const isAlreadyMarked = deletedList.some(
      (deletedLineItem) => deletedLineItem.id === lineItem.id,
    );

    if (isAlreadyMarked) {
      deletedListUpdater((prev) =>
        prev.filter(
          (deletedTakeOffItem) => deletedTakeOffItem.id !== lineItem.id,
        ),
      );
      return;
    }

    // Only the id is stored -- this list tracks WHICH items are marked,
    // it never needs to duplicate the full recipe/material/labour tree.
    deletedListUpdater((prev) => [...prev, { id: lineItem.id }]);
  }

  function showRecipeMaterials() {
    if (showRecipeItems == true) {
      setShowRecipeItems(false);
    }

    if (showRecipeItems == false) {
      setShowRecipeItems(true);
    }
  }
  return (
    <>
      <tr className="grid grid-cols-[70px_90px_1fr_1fr_100px_80px_160px_140px_120px] items-center border-b gap-2 ">
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <input
            checked={deletedList.some(
              (deletedLineItem) => takeOffLineItem.id === deletedLineItem.id,
            )}
            onChange={() => {
              addToOrRemoveFromDeleteList(takeOffLineItem);
            }}
            type="checkbox"
            className="h-4 w-4 rounded border-input accent-foreground"
          />
        </td>
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <button
            onClick={() => {
              showRecipeMaterials();
            }}
            className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRecipeItems == false ? (
              <MdOutlineExpandLess />
            ) : (
              <MdOutlineExpandMore />
            )}
          </button>
        </td>
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <input
            className="rounded-md border border-input bg-background px-2 py-2 text-sm w-full placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="scope"
            type="text"
          />
        </td>
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <input
            className="rounded-md border border-input bg-background px-2 py-2 text-sm w-full placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="item"
            type="text"
          />
        </td>
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <input
            className="rounded-md border border-input bg-background px-2 py-2 text-sm w-full placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder={`${takeOffLineItem.measurement}`}
            type="number"
          />
        </td>
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <p className="rounded-md border bg-muted px-2 py-2 text-sm text-muted-foreground">
            {"m2"}
          </p>
        </td>
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <p className="rounded-md border bg-muted px-2 py-2 text-sm text-muted-foreground">
            {"Concrete"}
          </p>
        </td>
        <td className="flex gap-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <button className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <MdOutlineChangeCircle />
          </button>
          <button className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors">
            <MdDeleteOutline />
          </button>
        </td>
        <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <p className="inline-flex items-center rounded-full border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {"Validated.."}
          </p>
        </td>
      </tr>
      {showRecipeItems ? (
        <tr>
          <td className="flex flex-1 bg-muted/30 p-4 items-center gap-2 border-b">
            <RecipeModal recipe={takeOffLineItem.recipe} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
