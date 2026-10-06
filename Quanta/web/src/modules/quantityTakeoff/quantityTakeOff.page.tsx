import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import {
  getProjectBillOfQuantities,
  updateLineItems,
  updateProjectStatus,
  deleteLineItems,
  deleteProjectBillOfQuantities,
} from "@/modules/quantityTakeoff/api/api";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import {
  LineItem,
  type LineItemPatch,
} from "@/modules/quantityTakeoff/components/lineItem";
import { ConfirmDeletionModal } from "@/modules/quantityTakeoff/components/confirmDeletion";
import { PreviewQuantitiesModal } from "@/modules/quantityTakeoff/components/previewQuantities.modal";
import { LoadingModal } from "@/common/components/loadingModal";
import { getActiveScope } from "@/common/storage/activeScope";
import {
  MdOutlinePreview,
  MdOutlineSave,
  MdCheckCircleOutline,
  MdOutlineRestartAlt,
  MdOutlineSearch,
} from "react-icons/md";

// TODO :: [backend] The header shows no project name because the takeoff
// endpoint doesn't return one. Add it to the response and show it under the title.

const toolbarButton =
  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/70 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const primaryButton =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

/**
 * The quantity takeoff of one project: the heart of the product.
 *
 * Each line applies a recipe to ONE measurement (for example the brick wall
 * recipe to 114.2 m²) and shows every material, labour and overhead quantity
 * that measurement works out to. The user types the measurement, adds a
 * location and notes, and the totals update as they type.
 *
 * Edits live in the browser until Save, so a search or a reload never silently
 * discards them. Complete takeoff saves anything unsaved, then marks the
 * project complete.
 */
export function BillOfQuantsPage() {
  const { companyId, projectId } = getActiveScope();

  // A takeoff belongs to a project; without one there is nothing to show
  if (!companyId || !projectId) {
    return <Navigate to="/projects" replace />;
  }

  return <TakeoffEditor companyId={companyId} projectId={projectId} />;
}

function TakeoffEditor({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const navigate = useNavigate();
  const [lineItems, setLineItems] = useState<GetBillOfQuantsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // ids of the line items the user is about to delete (null = no dialog open)
  const [idsToDelete, setIdsToDelete] = useState<string[] | null>(null);
  const [showStartAfresh, setShowStartAfresh] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  // text of the "please wait" overlay while saving or completing (null = hidden)
  const [busyMessage, setBusyMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLineItems() {
      try {
        setLineItems(await getProjectBillOfQuantities({ companyId, projectId }));
      } catch {
        // apiClient already records the failure in global error state
      } finally {
        setIsLoading(false);
      }
    }

    loadLineItems();
  }, [companyId, projectId]);

  // Searching in the browser (not by re-fetching) means unsaved edits are
  // never wiped by a search.
  const visibleItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return lineItems;

    return lineItems.filter((item) =>
      [
        item.description,
        item.notes ?? "",
        item.recipe?.name ?? "",
        item.recipe?.category.name ?? "",
      ].some((text) => text.toLowerCase().includes(term)),
    );
  }, [lineItems, searchTerm]);

  function updateLineItemFields(id: string, patch: LineItemPatch) {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setHasUnsavedChanges(true);
  }

  // Returns whether the save worked, so "Complete takeoff" knows whether to go on
  async function saveBillOfQuants(): Promise<boolean> {
    setBusyMessage("Saving items");
    try {
      await updateLineItems({
        companyId,
        projectId,
        lineItems: lineItems.map(({ id, description, measurement, notes }) => ({
          id,
          description,
          measurement,
          notes,
        })),
      });
      setHasUnsavedChanges(false);
      return true;
    } catch {
      // apiClient already records the failure; edits stay on screen, unsaved
      return false;
    } finally {
      setBusyMessage(null);
    }
  }

  // Anything not yet saved would be missing from the completed record, so
  // unsaved edits are saved first. Once complete, the project shows as
  // Completed on the projects list, so the user goes back there.
  async function completeTakeOff() {
    if (hasUnsavedChanges && !(await saveBillOfQuants())) return;

    setBusyMessage("Completing takeoff");
    try {
      await updateProjectStatus({ companyId, projectId, completed: true });
      navigate("/projects");
    } catch {
      // apiClient already records the failure; the takeoff stays open
    } finally {
      setBusyMessage(null);
    }
  }

  // Run by the confirm dialog. Throwing keeps the dialog open with an error.
  async function deleteSelectedLineItems(ids: string[]) {
    const deleted = await deleteLineItems({
      companyId,
      projectId,
      lineItemIds: ids,
    });
    if (deleted.length === 0) throw new Error("No line items were deleted");

    const deletedIds = new Set(deleted.map((item) => item.id));
    setLineItems((prev) => prev.filter((item) => !deletedIds.has(item.id)));
  }

  async function clearTakeoff() {
    const response = await deleteProjectBillOfQuantities({
      companyId,
      projectId,
    });
    if (response.deletedItems === 0) throw new Error("Nothing was deleted");

    setLineItems([]);
    setHasUnsavedChanges(false);
  }

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-sm font-medium text-foreground">
            Quantity takeoff
          </h1>
          <p className="text-sm text-muted-foreground">
            {lineItems.length} line item{lineItems.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {hasUnsavedChanges ? (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          ) : null}
          <button
            disabled={lineItems.length === 0}
            onClick={() => setShowPreview(true)}
            className={toolbarButton}
          >
            <MdOutlinePreview size={18} /> Preview quantities
          </button>
          <button
            disabled={lineItems.length === 0}
            onClick={() => setShowStartAfresh(true)}
            className={`${toolbarButton} text-destructive`}
          >
            <MdOutlineRestartAlt size={18} /> Start afresh
          </button>
          <button
            disabled={lineItems.length === 0}
            onClick={() => saveBillOfQuants()}
            className={toolbarButton}
          >
            <MdOutlineSave size={18} /> Save
          </button>
          <button
            disabled={lineItems.length === 0}
            onClick={() => completeTakeOff()}
            className={primaryButton}
          >
            <MdCheckCircleOutline size={18} /> Complete takeoff
          </button>
        </div>
      </div>

      <div className="flex flex-row justify-start border-b p-2 shrink-0">
        <div className="flex flex-row items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
          <MdOutlineSearch size={20} className="text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent text-sm focus-visible:outline-none placeholder:text-muted-foreground"
            type="text"
            placeholder="Search line items…"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading line items…
          </p>
        ) : lineItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No line items yet.
          </p>
        ) : visibleItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No line items match "{searchTerm}".
          </p>
        ) : (
          <div className="rounded-lg border bg-card text-card-foreground">
            {visibleItems.map((item) => (
              <LineItem
                key={item.id}
                takeOffLineItem={item}
                onUpdate={updateLineItemFields}
                onDelete={(id) => setIdsToDelete([id])}
              />
            ))}
          </div>
        )}
      </div>

      {idsToDelete ? (
        <ConfirmDeletionModal
          header="Delete line item"
          message="Are you sure you want to delete this line item? This action cannot be reversed."
          onConfirm={() => deleteSelectedLineItems(idsToDelete)}
          onClose={() => setIdsToDelete(null)}
        />
      ) : null}

      {showStartAfresh ? (
        <ConfirmDeletionModal
          header="Start project afresh"
          message="Are you sure you want to restart the project? All takeoff will be deleted and this action cannot be reversed."
          onConfirm={clearTakeoff}
          onClose={() => setShowStartAfresh(false)}
        />
      ) : null}

      {showPreview ? (
        <PreviewQuantitiesModal
          lineItems={lineItems}
          onClose={() => setShowPreview(false)}
        />
      ) : null}

      <LoadingModal
        show={busyMessage !== null}
        message={busyMessage ?? ""}
      />
    </div>
  );
}