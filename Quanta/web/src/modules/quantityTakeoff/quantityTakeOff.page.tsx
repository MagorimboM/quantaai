import { useEffect, useState } from "react";
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

// TODO :: replace comp, proj and user id with dynamic variables
// TODO :: move the contracts to their folder
// TODO :: create a keyDown function for search input

export type LineItemId = {
  id: string;
};

export function BillOfQuantsPage() {
  // Full line items currently on this project's Bill of Quantities.
  const [LineItems, setLineItems] = useState<GetBillOfQuantsResponse[]>([]);

  // Lightweight -- only ids, not full line item objects -- tracks which
  // rows are checked for bulk deletion. Kept separate from LineItems so
  // we're never duplicating full recipe/material data just to mark a row.
  const [deletedLineItems, setDeletedLineItems] = useState<LineItemId[]>([]);

  // Toggles the "confirm delete selected items" modal on/off.
  const [showDeletedSelectedItems, setShowDeletedSelectedItems] =
    useState<boolean>(false);

  // Toggles the "confirm start project afresh" modal on/off.
  const [showStartAfreshConfirmation, setShowStartAfreshConfirmation] =
    useState<boolean>(false);

  // Toggles the "saving..." progress modal while saveBillOfQuants runs.
  const [showSavingModal, setShowSavingModal] = useState<boolean>(false);

  // On mount: load this project's existing line items from the backend.
  useEffect(() => {
    async function getProjectBillOfQuants() {
      // TODO :: replace the companyId and ProjectId with dynamic data.
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

  async function searchBillOfQuants(
    event: React.ChangeEvent<HTMLInputElement>,
    page: number,
  ) {
    const searchedTerm = event.target.value;
    // remove any white spaces
    searchedTerm.trim();

    // wait for 400 ms before doing something
    setTimeout(async () => {
      const results = await getProjectBillOfQuantities({
        companyId: "seed-company-001",
        projectId: "seed-proj-001",
        query: searchedTerm,
        page: page,
        limit: 10,
      });

      console.log(results);
      setLineItems(results);
      // when the search bar is empty

      if (searchedTerm.length == 0) {
        const results = await getProjectBillOfQuantities({
          companyId: "seed-company-001",
          projectId: "seed-proj-001",
          query: "",
          page: 1,
          limit: 10,
        });

        setLineItems(results);
      }
    }, 400);
  }

  // Opens/closes the Start Afresh confirmation modal (acts as a toggle).
  async function showStartAfreshModal() {
    if (showStartAfreshConfirmation == true) {
      setShowStartAfreshConfirmation(false);

      return;
    }

    setShowStartAfreshConfirmation(true);
  }

  // Persists every current line item to the backend. Shows the saving
  // modal for the duration of the request so the user gets feedback
  // while the save is in flight.
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
    // close the saving modal
    setShowSavingModal(false);
    return;
  }

  // Marks the project's status as completed on the backend.
  async function completeTakeOff() {
    // send all the items to be saved to the database..
    const response = await updateProjectStatus({
      companyId: "seed-company-001",
      completed: true,
      projectId: "seed-proj-001",
    });

    // click that the object has been completed.

    if (response) {
      return;
    }
  }

  // Opens the "confirm delete selected items" modal.
  async function deleteSelectedItems() {
    setShowDeletedSelectedItems(true);
  }

  // Want: is EVERY current line item currently marked for deletion?
  // Drives the header row's "select all" checkbox state. Checked by
  // actual id membership, not array length, so it stays correct even if
  // items were swapped rather than just added/removed.
  function areAllLineItemsInDeletedList() {
    if (LineItems.length === 0) return false;
    return LineItems.every((lineItem) =>
      deletedLineItems.some(
        (deletedLineItem) => deletedLineItem.id === lineItem.id,
      ),
    );
  }

  // Header "select all" checkbox handler: if everything is already
  // selected, clear the selection entirely; otherwise select everything.
  function addAllTodDeleteList() {
    if (areAllLineItemsInDeletedList()) {
      setDeletedLineItems([]);
      return;
    }
    setDeletedLineItems(LineItems.map((lineItem) => ({ id: lineItem.id })));
  }

  return (
    <>
      {/* Top toolbar: page title + primary actions (preview, delete, start
          afresh, save, complete). Buttons disable themselves whenever
          LineItems is empty, since none of these actions make sense with
          nothing on the page yet. */}
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
          {/* Only enabled once at least one row is checked for deletion. */}
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

      {/* Search bar — filters the line items list (wiring not yet
          implemented, input is currently uncontrolled). */}
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

      {/* Main Bill of Quantities table — header defines the column grid
          template, each LineItem row must use the exact same grid-cols
          value or columns will drift out of alignment. */}
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
                {/* "Select all" checkbox — checked state is derived, not
                    stored separately, so it can't drift out of sync with
                    the actual per-row selections below. */}
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

      {/* Confirm-delete modal — only rendered while the user has the
          delete flow open. */}
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

      {/* Confirm-start-afresh modal — wipes all takeoff items for this
          project on confirm. */}
      {showStartAfreshConfirmation ? (
        <StartAfreshModalConfirmation
          openCloseModal={showStartAfreshModal}
          showModal={showStartAfreshConfirmation}
          billOfQuantsUpdater={setLineItems}
        />
      ) : null}

      {/* Saving progress modal — visible only while saveBillOfQuants's
          request is in flight. */}
      <SavingBillOfQuantsModal show={showSavingModal} />
    </>
  );
}
