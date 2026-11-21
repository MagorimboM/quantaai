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
import { AddLineItemWorkspace } from "@/modules/quantityTakeoff/components/addLineItemWorkspace";
import {
  kicker,
  panelCard,
} from "@/modules/quantityTakeoff/components/takeoff.styles";
import { LoadingModal } from "@/common/components/loadingModal";
import { getActiveScope } from "@/common/storage/activeScope";
import {
  MdAutoAwesome,
  MdCheckCircleOutline,
  MdClose,
  MdOutlineCalculate,
  MdOutlineExpandMore,
  MdOutlinePreview,
  MdOutlineRestartAlt,
  MdOutlineSave,
  MdOutlineSearch,
  MdOutlineUploadFile,
} from "react-icons/md";
import { FiFolder } from "react-icons/fi";
import { AiAssistant } from "@/modules/aiAssistant/AiAssistant";
import { UploadModalComp } from "@/modules/projects/components/uploadModalComp";
import { FileModalComp } from "@/modules/projects/components/fileModalComp";

// TODO :: [backend] The header shows no project name because the takeoff
// endpoint doesn't return one. Add it to the response and show it under the title.
// TODO :: [backend] Zones and pricing aren't in the takeoff data yet, so the
// design's "Zone" selector and dollar totals aren't shown.

const NO_RECIPE_GROUP = "No recipe";

const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#EFECE6] bg-white text-[#78716C] transition-all hover:border-[#FFD1C4] hover:bg-[#FFF6F1] hover:text-[#FF6B4A] active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";

const primaryButton =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#FF6B4A] px-4 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(255,107,74,0.22)] transition-all hover:bg-[#F25C3C] active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100";

type SheetView = "category" | "all";

/**
 * The quantity takeoff of one project: the heart of the product.
 *
 * Three columns: the recipe library and the calculator (both inside
 * AddLineItemWorkspace) and, on the right, the takeoff sheet.
 *
 * Each line applies a recipe to ONE measurement (for example the brick wall
 * recipe to 114.2 m²) and shows every material, labour and overhead quantity
 * that measurement works out to. The user types the measurement, adds a
 * location and notes, and the totals update as they type.
 *
 * Edits live in the browser until Save, so searching never loses them.
 * Complete takeoff saves anything unsaved, then marks the project complete.
 *
 * The project's documents (view and upload) and the AI assistant also live
 * here: they act on one project, and this page is always about exactly one.
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
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showDocuments, setShowDocuments] = useState<boolean>(false);
  // text of the "please wait" overlay while saving or completing (null = hidden)
  const [busyMessage, setBusyMessage] = useState<string | null>(null);

  // Takeoff sheet display only: nothing here is saved
  const [view, setView] = useState<SheetView>("category");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [tipDismissed, setTipDismissed] = useState<boolean>(false);

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

  // The visible lines grouped by their recipe's category, A to Z
  const groups = useMemo(() => {
    const byName = new Map<string, GetBillOfQuantsResponse[]>();
    for (const item of visibleItems) {
      const name = item.recipe?.category.name ?? NO_RECIPE_GROUP;
      byName.set(name, [...(byName.get(name) ?? []), item]);
    }
    return [...byName.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleItems]);

  // The category with the most lines, for the tip card. Share of LINES, since
  // the takeoff holds quantities, not prices.
  const tip = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of lineItems) {
      if (!item.recipe) continue;
      const name = item.recipe.category.name;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    if (lineItems.length < 3 || counts.size < 2) return null;
    const [name, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return { name, percent: Math.round((count / lineItems.length) * 100) };
  }, [lineItems]);

  function toggleGroup(name: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

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

  // The workspace has already saved the new line on the server, so it is shown
  // as it is and doesn't count as an unsaved change.
  function appendLineItem(lineItem: GetBillOfQuantsResponse) {
    setLineItems((prev) => [...prev, lineItem]);
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

  function renderSheet() {
    const message = "py-10 text-center text-sm text-[#78716C]";
    if (isLoading) return <p className={message}>Loading line items…</p>;
    if (lineItems.length === 0) {
      return (
        <p className={message}>
          No line items yet. Pick a recipe, enter a measurement and add it.
        </p>
      );
    }
    if (visibleItems.length === 0) {
      return <p className={message}>No line items match "{searchTerm}".</p>;
    }

    if (view === "all") {
      return (
        <div className="overflow-hidden rounded-xl border border-[#EEEAE5] bg-white">
          {visibleItems.map((item) => (
            <LineItem
              key={item.id}
              takeOffLineItem={item}
              onUpdate={updateLineItemFields}
              onDelete={(id) => setIdsToDelete([id])}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2.5">
        {groups.map(([name, items]) => {
          const isOpen = !collapsedGroups.has(name);
          return (
            <section
              key={name}
              className="overflow-hidden rounded-xl border border-[#EBE7E2] bg-white"
            >
              <button
                type="button"
                onClick={() => toggleGroup(name)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center gap-2.5 bg-[#FAF9F7] px-3 py-2.5 text-left"
              >
                <span className="flex size-6 items-center justify-center rounded-lg border border-[#E6E1DC] bg-white text-[#817A74]">
                  <MdOutlineExpandMore
                    size={18}
                    className={`transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                </span>
                <span className="flex-1 text-sm font-semibold text-[#1C1917]">
                  {name}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#78716C] ring-1 ring-[#EBE7E2]">
                  {items.length}
                </span>
              </button>
              {isOpen
                ? items.map((item) => (
                    <LineItem
                      key={item.id}
                      takeOffLineItem={item}
                      showCategory={false}
                      onUpdate={updateLineItemFields}
                      onDelete={(id) => setIdsToDelete([id])}
                    />
                  ))
                : null}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* Top bar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#EBE7E1] bg-white/85 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#26221F] text-white shadow-[0_5px_14px_rgba(28,25,23,0.15)]">
            <MdOutlineCalculate size={20} />
          </span>
          <div className="flex flex-col gap-1">
            <span className={kicker}>Project workspace</span>
            <h1 className="text-sm font-bold tracking-tight text-[#1C1917]">
              Quantity takeoff
            </h1>
          </div>
          <span className="rounded-full border border-[#FFD8C8] bg-[#FFF1E9] px-2.5 py-1 text-[11px] font-semibold text-[#C44E31]">
            Takeoff Mode
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {hasUnsavedChanges ? (
            <span className="text-xs text-[#78716C]">Unsaved changes</span>
          ) : null}
          <span className="mr-1.5 text-sm text-[#78716C]">
            <strong className="font-bold text-[#292524]">
              {lineItems.length}
            </strong>{" "}
            item{lineItems.length === 1 ? "" : "s"}
          </span>

          <button
            type="button"
            title="View project documents"
            aria-label="View project documents"
            onClick={() => setShowDocuments(true)}
            className={iconButton}
          >
            <FiFolder size={18} />
          </button>
          <button
            type="button"
            title="Upload project files"
            aria-label="Upload project files"
            onClick={() => setShowUploadModal(true)}
            className={iconButton}
          >
            <MdOutlineUploadFile size={18} />
          </button>
          <button
            type="button"
            title="Preview quantities"
            aria-label="Preview quantities"
            disabled={lineItems.length === 0}
            onClick={() => setShowPreview(true)}
            className={iconButton}
          >
            <MdOutlinePreview size={18} />
          </button>

          <span className="h-6 w-px bg-[#EFECE6]" aria-hidden="true" />

          <button
            type="button"
            title="Start afresh"
            aria-label="Start afresh"
            disabled={lineItems.length === 0}
            onClick={() => setShowStartAfresh(true)}
            className={`${iconButton} text-red-600`}
          >
            <MdOutlineRestartAlt size={18} />
          </button>
          <button
            type="button"
            title="Save"
            aria-label="Save"
            disabled={lineItems.length === 0}
            onClick={() => saveBillOfQuants()}
            className={iconButton}
          >
            <MdOutlineSave size={18} />
          </button>

          <button
            type="button"
            disabled={lineItems.length === 0}
            onClick={() => completeTakeOff()}
            className={primaryButton}
          >
            <MdCheckCircleOutline size={18} /> Complete takeoff
          </button>
        </div>
      </header>

      {/* Three columns: 25% recipes, 40% calculator, 35% takeoff sheet */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,25fr)_minmax(0,40fr)_minmax(0,35fr)] gap-3 p-4">
        <AddLineItemWorkspace
          companyId={companyId}
          projectId={projectId}
          onAdded={appendLineItem}
        />

        <aside className={`${panelCard} p-5`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={kicker}>Estimate summary</span>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#1C1917]">
                Takeoff Sheet
              </h2>
            </div>
          </div>

          <div className="mt-4 grid h-9 shrink-0 grid-cols-2 gap-1 rounded-[10px] bg-[#F3F0EC] p-[3px]">
            {(
              [
                ["category", "By Category"],
                ["all", "All items"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`cursor-pointer rounded-lg text-xs font-semibold transition-colors ${
                  view === key
                    ? "bg-white text-[#292524] shadow-[0_2px_7px_rgba(57,45,37,0.09)]"
                    : "text-[#8E8780]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-[#EFECE6] bg-[#FAF9F7] px-2.5 focus-within:border-[#FF9A81] focus-within:bg-white focus-within:ring-[3px] focus-within:ring-[#FF6B4A]/10">
            <MdOutlineSearch size={18} className="text-[#78716C]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#A8A29E]"
              type="text"
              aria-label="Search line items"
              placeholder="Search line items…"
            />
          </div>

          {tip && !tipDismissed ? (
            <div className="relative mt-3 flex shrink-0 items-start gap-2.5 rounded-xl border border-[#F8DFAA] bg-[#FFFBEB] p-3 pr-9 bg-[radial-gradient(circle_at_90%_0%,rgba(236,72,153,0.08),transparent_38%)]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#FFE7A3] to-[#FFD8DD] text-[#C25B40]">
                <MdAutoAwesome size={16} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#1C1917]">
                  {tip.name} is {tip.percent}% of your line items
                </p>
                <p className="mt-0.5 text-xs text-[#91836D]">
                  Your biggest category so far.
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss tip"
                onClick={() => setTipDismissed(true)}
                className="absolute top-2 right-2 cursor-pointer rounded-md p-1 text-[#B2A48D] hover:text-[#1C1917]"
              >
                <MdClose size={14} />
              </button>
            </div>
          ) : null}

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5">
            {renderSheet()}
          </div>
        </aside>
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

      {showUploadModal ? (
        <UploadModalComp
          companyId={companyId}
          projectId={projectId}
          closeModal={() => setShowUploadModal(false)}
        />
      ) : null}

      <FileModalComp
        open={showDocuments}
        companyId={companyId}
        projectId={projectId}
        onClose={() => setShowDocuments(false)}
      />

      <AiAssistant />

      <LoadingModal
        show={busyMessage !== null}
        message={busyMessage ?? ""}
      />
    </div>
  );
}