import { useEffect, useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import type {
  CatalogueCategory,
  CatalogueItem,
  CatalogueKind,
  CreateRecipeApi,
  RecipeCatalogue,
} from "@/modules/recipeLibrary/contracts/createRecipe.types";
import {
  COMPONENT_SECTIONS,
  SECTION_KIND,
  SECTION_LABEL,
  type AddedComponents,
  type ComponentSection,
  type CreateKind,
} from "@/modules/recipeLibrary/contracts/recipeComponents";
import { RecipeComponentPicker } from "@/modules/recipeLibrary/components/recipeComponentPicker";
import {
  RecipeComponentList,
  type RecipeComponentRow,
} from "@/modules/recipeLibrary/components/recipeComponentList";
import { CreateCatalogueItemDialog } from "@/modules/recipeLibrary/components/createCatalogueItem.modal";
import { LoadingModal } from "@/common/components/loadingModal";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring";

type RecipeFormState = {
  name: string;
  categoryId: string;
  unit: string;
  description: string;
};

// What the "create" dialog is open for. null while it is closed.
type CreateDialogState = { kind: CreateKind; name: string } | null;

// Which catalogue section a newly created item belongs to
const SECTION_OF_KIND: Record<CatalogueKind, ComponentSection> = {
  material: "materials",
  labour: "labour",
  overhead: "overheads",
};

/**
 * Builds a new recipe (shared by the takeoff's Add line item and the recipe
 * library, which each pass their own `api`): describe it, then search the catalogue and add the
 * materials, labour and overheads that 1 unit of the work needs. Anything
 * missing from the catalogue is created from the small second form without
 * leaving this one.
 *
 * `onCreated` receives the saved recipe exactly as the screen's own `api` returns
 * it, so the screen can show it straight away.
 */
export function CreateRecipeModal<TCreated>({
  api,
  onCreated,
  onClose,
}: {
  api: CreateRecipeApi<TCreated>;
  onCreated: (recipe: TCreated) => void;
  onClose: () => void;
}) {
  const [catalogue, setCatalogue] = useState<RecipeCatalogue>({
    categories: [],
    materials: [],
    labour: [],
    overheads: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [form, setForm] = useState<RecipeFormState>({
    name: "",
    categoryId: "",
    unit: "",
    description: "",
  });
  const [added, setAdded] = useState<AddedComponents>({
    materials: [],
    labour: [],
    overheads: [],
  });

  const [section, setSection] = useState<ComponentSection>("materials");
  const [query, setQuery] = useState<string>("");
  const [createDialog, setCreateDialog] = useState<CreateDialogState>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalogue() {
      try {
        setCatalogue(await api.loadCatalogue());
      } catch {
        // apiClient already reports the failure; the lists stay empty
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalogue();
  }, [api]);

  function updateField<K extends keyof RecipeFormState>(
    field: K,
    value: RecipeFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function changeSection(next: ComponentSection) {
    setSection(next);
    setQuery("");
  }

  function addComponent(itemId: string) {
    setAdded((prev) => ({
      ...prev,
      [section]: [...prev[section], { itemId, quantity: "1" }],
    }));
  }

  function removeComponent(target: ComponentSection, itemId: string) {
    setAdded((prev) => ({
      ...prev,
      [target]: prev[target].filter((component) => component.itemId !== itemId),
    }));
  }

  function changeQuantity(
    target: ComponentSection,
    itemId: string,
    quantity: string,
  ) {
    setAdded((prev) => ({
      ...prev,
      [target]: prev[target].map((component) =>
        component.itemId === itemId ? { ...component, quantity } : component,
      ),
    }));
  }

  // A catalogue item has to be filed under a category, and it takes the
  // recipe's. So the category must be chosen before anything can be created
  // (a new category itself is always allowed).
  function openCreateItem(name: string) {
    if (form.categoryId === "") {
      setErrorMessage("Choose a category first. New items are filed under it.");
      return;
    }
    setErrorMessage(null);
    setCreateDialog({ kind: SECTION_KIND[section], name });
  }

  function openCreateCategory() {
    setErrorMessage(null);
    setCreateDialog({ kind: "category", name: "" });
  }

  // A just-created item goes into the catalogue and straight into the recipe
  function itemCreated(kind: CatalogueKind, item: CatalogueItem) {
    const target = SECTION_OF_KIND[kind];
    setCatalogue((prev) => ({ ...prev, [target]: [...prev[target], item] }));
    setAdded((prev) => ({
      ...prev,
      [target]: [...prev[target], { itemId: item.id, quantity: "1" }],
    }));
    setSection(target);
    setQuery("");
  }

  // A just-created category is chosen for the recipe straight away
  function categoryCreated(category: CatalogueCategory) {
    setCatalogue((prev) => ({
      ...prev,
      categories: [...prev.categories, category].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));
    updateField("categoryId", category.id);
  }

  const rows: RecipeComponentRow[] = COMPONENT_SECTIONS.flatMap((key) =>
    added[key].flatMap((component) => {
      const item = catalogue[key].find((i) => i.id === component.itemId);
      return item
        ? [
            {
              section: key,
              itemId: item.id,
              name: item.name,
              unit: item.unit,
              quantity: component.quantity,
            },
          ]
        : [];
    }),
  );

  const addedCounts: Record<ComponentSection, number> = {
    materials: added.materials.length,
    labour: added.labour.length,
    overheads: added.overheads.length,
  };

  // Every quantity must be a number above zero (the backend checks again)
  const quantitiesValid = COMPONENT_SECTIONS.every((key) =>
    added[key].every((component) => {
      const quantity = parseFloat(component.quantity);
      return !Number.isNaN(quantity) && quantity > 0;
    }),
  );
  const canSave =
    form.name.trim() !== "" &&
    form.categoryId !== "" &&
    form.unit.trim() !== "" &&
    rows.length > 0 &&
    quantitiesValid &&
    !isSaving;

  async function saveRecipe() {
    if (!canSave) return;

    function toRequest(key: ComponentSection) {
      return added[key].map((component) => ({
        itemId: component.itemId,
        quantity: parseFloat(component.quantity),
      }));
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      const created = await api.createRecipe({
        name: form.name.trim(),
        categoryId: form.categoryId,
        unit: form.unit.trim(),
        description: form.description.trim() === "" ? null : form.description.trim(),
        materials: toRequest("materials"),
        labour: toRequest("labour"),
        overheads: toRequest("overheads"),
      });
      onCreated(created);
      onClose();
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Couldn't save the recipe. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  const categoryName =
    catalogue.categories.find((c) => c.id === form.categoryId)?.name ?? "";

  return (
    <>
      <div
        className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        // A stray click must not close the modal while the recipe is saving
        onClick={isSaving ? undefined : onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex h-170 max-h-full w-full max-w-235 flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg"
        >
          <div className="flex items-start justify-between border-b px-5 py-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Create recipe
              </h1>
              <p className="text-sm text-secondary-foreground">
                Describe what 1 unit of this work needs. Quantities are per 1 unit.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer rounded-md border p-1.5 text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* Left: the recipe's own details */}
            <div className="flex w-85 shrink-0 flex-col gap-3.5 overflow-y-auto border-r px-5 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Recipe details
              </span>

              <div className="flex flex-col gap-1">
                <label htmlFor="recipe-name" className="text-xs font-medium text-foreground">
                  Name<span className="ml-0.5 text-destructive">*</span>
                </label>
                <input
                  id="recipe-name"
                  type="text"
                  placeholder="e.g. 110mm Brick Wall"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="recipe-category" className="text-xs font-medium text-foreground">
                  Category<span className="ml-0.5 text-destructive">*</span>
                </label>
                <select
                  id="recipe-category"
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a category</option>
                  {catalogue.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="flex cursor-pointer items-center gap-1 self-start py-0.5 text-xs font-medium text-primary hover:underline"
                >
                  <MdAdd size={12} />
                  Create new category
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="recipe-unit" className="text-xs font-medium text-foreground">
                  Per (unit)<span className="ml-0.5 text-destructive">*</span>
                </label>
                <input
                  id="recipe-unit"
                  type="text"
                  placeholder="e.g. m²"
                  value={form.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                  className={`${inputClass} w-30`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="recipe-description" className="text-xs font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="recipe-description"
                  placeholder="What this recipe covers and what it leaves out"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="h-22 w-full resize-none rounded-md border border-input bg-background px-2.5 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Right: pick components from the catalogue, then set quantities */}
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-5 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Components
              </span>

              <RecipeComponentPicker
                section={section}
                query={query}
                items={catalogue[section]}
                addedIds={added[section].map((component) => component.itemId)}
                addedCounts={addedCounts}
                onSectionChange={changeSection}
                onQueryChange={setQuery}
                onAdd={addComponent}
                onCreate={openCreateItem}
              />

              <RecipeComponentList
                rows={rows}
                recipeUnit={form.unit.trim()}
                onQuantityChange={changeQuantity}
                onRemove={removeComponent}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t px-5 py-3.5">
            <p
              className={`text-xs ${errorMessage ? "text-destructive" : "text-muted-foreground"}`}
            >
              {errorMessage ??
                (isLoading
                  ? "Loading your catalogue…"
                  : COMPONENT_SECTIONS.map(
                      (key) => `${addedCounts[key]} ${SECTION_LABEL[key].toLowerCase()}`,
                    ).join(" · "))}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 cursor-pointer rounded-md border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRecipe}
                disabled={!canSave}
                className="h-9 cursor-pointer rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save recipe
              </button>
            </div>
          </div>
        </div>

        <LoadingModal show={isSaving} message="Saving recipe" />
      </div>

      {/* A sibling of the overlay above, not a child: a click inside it must not
          bubble up and close the recipe form behind it */}
      {createDialog ? (
        <CreateCatalogueItemDialog
          api={api}
          kind={createDialog.kind}
          initialName={createDialog.name}
          categoryId={form.categoryId}
          categoryName={categoryName}
          onCreatedItem={itemCreated}
          onCreatedCategory={categoryCreated}
          onClose={() => setCreateDialog(null)}
        />
      ) : null}
    </>
  );
}