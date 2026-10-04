import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import {
  getProjectBillOfQuantities,
  updateLineItem,
  updateProjectStatus,
} from "@/modules/quantityTakeoff/api/services";
import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import {
  LineItem,
  type LineItemPatch,
} from "@/modules/quantityTakeoff/components/lineItem";
import {
  MdOutlinePreview,
  MdOutlineSave,
  MdCheckCircleOutline,
  MdOutlineRestartAlt,
  MdOutlineSearch,
} from "react-icons/md";
import {
  ConfirmDeletionModal,
  type LineItemId,
} from "@/modules/quantityTakeoff/components/confirmDeletion";
import { StartAfreshModalConfirmation } from "@/modules/quantityTakeoff/components/startAfreshModal";
import { SavingBillOfQuantsModal } from "@/modules/quantityTakeoff/components/savingModal";
import { PreviewQuantitiesModal } from "@/modules/quantityTakeoff/components/previewQuantities.modal";

// TODO :: the header shows no project name -- the bill-of-quantities endpoint
// doesn't return one. Add it to the response (or store it in localStorage when
// navigating in) and show it under the title.

const toolbarButton =
  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/70 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const primaryButton =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

export function BillOfQuantsPage() {
  const [lineItems, setLineItems] = useState<GetBillOfQuantsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [itemsToDelete, setItemsToDelete] = useState<LineItemId[] | null>(null);
  const [showStartAfreshConfirmation, setShowStartAfreshConfirmation] =
    useState<boolean>(false);
  const [showSavingModal, setShowSavingModal] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const workspaceId = localStorage.getItem("workspaceId");
  const companyId = localStorage.getItem("companyId");
  const projectId = localStorage.getItem("projectId");

  const hasNoScopeIds =
    (workspaceId == null || workspaceId == "") &&
    (companyId == null || companyId == "") &&
    (projectId == null || projectId == "");

  useEffect(() => {
    if (hasNoScopeIds) return;

    async function loadLineItems() {
      try {
        // NOTE :: the backend ignores query/page/limit today, so every line
        // item comes back. Search happens in the browser (see visibleItems).
        const response = await getProjectBillOfQuantities({
          companyId: companyId ?? "",
          projectId: projectId ?? "",
          query: "",
          page: 1,
          limit: 10,
        });
        setLineItems(response);
      } catch {
        // apiClient already records the failure in global error state
      } finally {
        setIsLoading(false);
      }
    }

    loadLineItems();
  }, []);

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

  async function saveBillOfQuants() {
    setShowSavingModal(true);
    try {
      await updateLineItem({
        companyId: companyId ?? "",
        projectId: projectId ?? "",
        body: lineItems.map((lineItem) => ({
          id: lineItem.id,
          userId: null,
          companyId: companyId ?? "",
          projectId: projectId ?? "",
          recipeId: lineItem.recipe?.id ?? null,
          description: lineItem.description,
          measurement: lineItem.measurement,
          unit: lineItem.unit,
          notes: lineItem.notes,
        })),
      });
      setHasUnsavedChanges(false);
    } catch {
      // apiClient already records the failure; edits stay on screen, unsaved
    } finally {
      setShowSavingModal(false);
    }
  }

  async function completeTakeOff() {
    await updateProjectStatus({
      companyId: companyId ?? "",
      completed: true,
      projectId: projectId ?? "",
    });
  }

  if (hasNoScopeIds) {
    return <Navigate to="/projects" replace />;
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
            onClick={() => setShowStartAfreshConfirmation(true)}
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
                onDelete={(id) => setItemsToDelete([{ id }])}
              />
            ))}
          </div>
        )}
      </div>

      {itemsToDelete ? (
        <ConfirmDeletionModal
          companyId={companyId ?? ""}
          projectId={projectId ?? ""}
          billOfQuantsUpdater={setLineItems}
          deletedLineItemsList={itemsToDelete}
          openClose={(show) => {
            if (!show) setItemsToDelete(null);
          }}
          header="Delete line item"
          message="Are you sure you want to delete this line item? This action cannot be reversed."
        />
      ) : null}

      {showStartAfreshConfirmation ? (
        <StartAfreshModalConfirmation
          companyId={companyId ?? ""}
          projectId={projectId ?? ""}
          billOfQuantsUpdater={setLineItems}
          openCloseModal={() => setShowStartAfreshConfirmation(false)}
        />
      ) : null}

      {showPreview ? (
        <PreviewQuantitiesModal
          lineItems={lineItems}
          onClose={() => setShowPreview(false)}
        />
      ) : null}

      <SavingBillOfQuantsModal show={showSavingModal} />
    </div>
  );
}
