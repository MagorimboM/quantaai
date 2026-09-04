import { useEffect, useState, useRef } from "react";
import {
  getProjectBillOfQuantities,
  updateLineItem,
  updateProjectStatus,
} from "@/modules/quantityTakeoff/api/services";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import { LineItem } from "@/modules/quantityTakeoff/components/lineItem";
import {
  MdOutlinePreview,
  MdOutlineSave,
  MdCheckCircleOutline,
  MdOutlineRestartAlt,
  MdDeleteOutline,
  MdOutlineSearch,
} from "react-icons/md";
import { IoLibraryOutline } from "react-icons/io5";
import { ConfirmDeletionModal } from "@/modules/quantityTakeoff/components/confirmDeletion";
import { StartAfreshModalConfirmation } from "@/modules/quantityTakeoff/components/startAfreshModal";
import { SavingBillOfQuantsModal } from "@/modules/quantityTakeoff/components/savingModal";

export type LineItemId = {
  id: string;
};

export function BillOfQuantsPage() {
  const [LineItems, setLineItems] = useState<GetBillOfQuantsResponse[]>([]);
  const [deletedLineItems, setDeletedLineItems] = useState<LineItemId[]>([]);
  const [showDeletedSelectedItems, setShowDeletedSelectedItems] =
    useState<boolean>(false);
  const [showStartAfreshConfirmation, setShowStartAfreshConfirmation] =
    useState<boolean>(false);
  const [showSavingModal, setShowSavingModal] = useState<boolean>(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function getProjectBillOfQuants() {
      const response = await getProjectBillOfQuantities({
        companyId: "seed-company-001",
        projectId: "seed-proj-001",
        limit: 10,
        page: 1,
        query: "",
      });

      setLineItems(response);
    }

    getProjectBillOfQuants();
  }, []);

  function searchBillOfQuants(
    event: React.ChangeEvent<HTMLInputElement>,
    page: number,
  ) {
    const searchedTerm = event.target.value.trim();

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await getProjectBillOfQuantities({
        companyId: "seed-company-001",
        projectId: "seed-proj-001",
        query: searchedTerm,
        page: page,
        limit: 10,
      });

      setLineItems(results);
    }, 400);
  }

  async function showStartAfreshModal() {
    if (showStartAfreshConfirmation == true) {
      setShowStartAfreshConfirmation(false);

      return;
    }

    setShowStartAfreshConfirmation(true);
  }

  async function saveBillOfQuants() {
    setShowSavingModal(true);
    const response = await updateLineItem({
      companyId: "seed-company-001",
      body: LineItems.map((lineItem, key) => ({
        id: lineItem.id,
        userId: "",
        companyId: "seed-company-001",
        projectId: "seed-proj-001",
        recipeId: lineItem.recipe?.id || "",
        description: lineItem.description,
        measurement: lineItem.measurement,
        unit: lineItem.unit,
        notes: lineItem.notes,
      })),
      projectId: "seed-proj-001",
    });
    setShowSavingModal(false);
    return;
  }

  async function completeTakeOff() {
    const response = await updateProjectStatus({
      companyId: "seed-company-001",
      completed: true,
      projectId: "seed-proj-001",
    });

    if (response) {
      return;
    }
  }

  async function deleteSelectedItems() {
    setShowDeletedSelectedItems(true);
  }

  function areAllLineItemsInDeletedList() {
    if (LineItems.length === 0) return false;
    return LineItems.every((lineItem) =>
      deletedLineItems.some(
        (deletedLineItem) => deletedLineItem.id === lineItem.id,
      ),
    );
  }

  function addAllTodDeleteList() {
    if (areAllLineItemsInDeletedList()) {
      setDeletedLineItems([]);
      return;
    }
    setDeletedLineItems(LineItems.map((lineItem) => ({ id: lineItem.id })));
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background text-foreground">
        <div className="flex items-center p-2 gap-6">
          <button className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-foreground hover:text-background active:scale-95 cursor-pointer">
            <IoLibraryOutline size={18} /> View Library
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-foreground">
              Quantity TakeOff
            </h1>
            <p className="text-sm text-muted-foreground">
              Harbor View Apartments
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 p-2 justify-end items-center">
          <button
            disabled={LineItems.length == 0 ? (true ): (false)}
            className={
              LineItems.length > 0
                ? "text-secondary-foreground bg-secondary hover:bg-secondary/70 active:scale-95 cursor-pointer inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-all"
                : "text-neutral-400 bg-neutral-100 cursor-not-allowed inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-all"
            }
          >
            <MdOutlinePreview size={18} /> Preview Quantities
          </button>
          <button
            disabled={deletedLineItems.length > 0 ? false : true}
            onClick={() => deleteSelectedItems()}
            className={`${deletedLineItems.length > 0 ? "text-destructive cursor-pointer active:scale-95" : "text-gray-400 cursor-not-allowed"} inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border bg-secondary px-4 py-2 text-sm font-medium transition-all hover:bg-secondary/70 `}
          >
            <MdDeleteOutline size={18} /> Deleted Selected
          </button>
          <button
            disabled={LineItems.length === 0}
            onClick={() => setShowStartAfreshConfirmation(true)}
            className={
              LineItems.length > 0
                ? "text-destructive bg-secondary hover:bg-secondary/70 active:scale-95 cursor-pointer inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-all"
                : "text-neutral-400 bg-neutral-100 cursor-not-allowed inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-all"
            }
          >
            <MdOutlineRestartAlt size={18} /> Start Afresh
          </button>
          <button
            onClick={() => saveBillOfQuants()}
            disabled={LineItems.length === 0}
            className={
              LineItems.length > 0
                ? "text-green-600 bg-secondary hover:bg-secondary/70 active:scale-95 cursor-pointer inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-all"
                : "text-neutral-400 bg-neutral-100 cursor-not-allowed inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-all"
            }
          >
            <MdOutlineSave size={18} /> Save
          </button>
          <button
            disabled={LineItems.length === 0}
            onClick={() => completeTakeOff()}
            className={
              LineItems.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all"
            }
          >
            <MdCheckCircleOutline size={18} /> Complete TakeOff
          </button>
        </div>
      </div>

      <div className="flex flex-row justify-start border-b p-2 bg-background">
        <div className="flex flex-row items-center gap-2 border border-input rounded-md px-2 py-1.5 bg-background">
          <MdOutlineSearch size={20} className="text-muted-foreground" />
          <input
            onChange={(e) => searchBillOfQuants(e, 1)}
            className="border-0 bg-transparent text-sm focus-visible:outline-none placeholder:text-muted-foreground"
            type="text"
            placeholder="Search your line item... "
          />
        </div>
      </div>

      <div
        title="bill-of-quants"
        className="flex-1 bg-background text-foreground"
      >
        <table className="flex flex-col flex-1 rounded-lg border bg-card text-card-foreground">
          <thead className="border-b p-2 bg-muted/40">
            <tr className="grid grid-cols-[70px_90px_1fr_1fr_100px_80px_160px_140px_120px] items-center gap-2">
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                SELECT
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                <input
                  checked={areAllLineItemsInDeletedList()}
                  onChange={() => addAllTodDeleteList()}
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-foreground"
                />
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                SCOPE
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                ITEM
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                QUANTITY
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                UNIT
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                APPLIED RECIPE
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                ACTION
              </th>
              <th className="text-left font-medium text-xs uppercase tracking-wide text-muted-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                STATUS
              </th>
            </tr>
          </thead>

          <tbody className="flex flex-col p-2 gap-2 scroll-py">
            {LineItems.length > 0
              ? LineItems.map((lineItem, key) => (
                  <LineItem
                    key={key}
                    takeOffLineItem={lineItem}
                    deletedListUpdater={setDeletedLineItems}
                    deletedList={deletedLineItems}
                    takeOffLineItemsList={LineItems}
                  />
                ))
              : null}
          </tbody>
        </table>
      </div>

      {showDeletedSelectedItems ? (
        <ConfirmDeletionModal
          billOfQuantsUpdater={setLineItems}
          showDeleteModal={showDeletedSelectedItems}
          deletedLineItemsList={deletedLineItems}
          openClose={setShowDeletedSelectedItems}
          header="Delete Selected Items"
          message="Are you sure you want to delete these items? This action cannot be reversed"
        />
      ) : null}

      {showStartAfreshConfirmation ? (
        <StartAfreshModalConfirmation
          openCloseModal={showStartAfreshModal}
          showModal={showStartAfreshConfirmation}
          billOfQuantsUpdater={setLineItems}
        />
      ) : null}

      <SavingBillOfQuantsModal show={showSavingModal} />
    </>
  );
}