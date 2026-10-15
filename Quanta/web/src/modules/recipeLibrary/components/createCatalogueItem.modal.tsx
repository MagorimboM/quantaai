import { useState } from "react";
import { MdClose } from "react-icons/md";
import type {
  CatalogueCategory,
  CatalogueItem,
  CatalogueKind,
  CreateRecipeApi,
} from "@/modules/recipeLibrary/contracts/createRecipe.types";
import type { CreateKind } from "@/modules/recipeLibrary/contracts/recipeComponents";
import { LoadingModal } from "@/common/components/loadingModal";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

// The units offered for each kind of item. Materials are counted in many ways;
// labour and overheads are counted in time.
const UNITS: Record<CatalogueKind, string[]> = {
  material: ["Nr", "m", "m²", "m³", "kg", "t", "L", "bag", "sheet"],
  labour: ["hr", "day"],
  overhead: ["hr", "day", "week", "month", "item"],
};

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring";

type CreateFormState = {
  name: string;
  unit: string;
  labourType: string;
};

// The small second form: creates a material, labour, overhead or category that
// was missing from the catalogue. It saves straight away and hands the new row
// back, so the recipe can use it without reloading the catalogue.
//
// A catalogue item must belong to a category, so it is filed under the
// category already chosen on the recipe, and the form says so.
export function CreateCatalogueItemDialog({
  api,
  kind,
  initialName,
  categoryId,
  categoryName,
  onCreatedItem,
  onCreatedCategory,
  onClose,
}: {
  api: Pick<CreateRecipeApi<unknown>, "createCatalogueItem" | "createCategory">;
  kind: CreateKind;
  // What was typed in the search box, so the user doesn't type it twice
  initialName: string;
  categoryId: string;
  categoryName: string;
  onCreatedItem: (kind: CatalogueKind, item: CatalogueItem) => void;
  onCreatedCategory: (category: CatalogueCategory) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateFormState>({
    name: initialName,
    unit: "",
    labourType: "",
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateField<K extends keyof CreateFormState>(
    field: K,
    value: CreateFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isCategory = kind === "category";
  const needsLabourType = kind === "labour";
  const canSave =
    form.name.trim() !== "" &&
    (isCategory || form.unit !== "") &&
    (!needsLabourType || form.labourType.trim() !== "") &&
    !isSaving;

  async function save() {
    if (!canSave) return;

    setErrorMessage(null);
    setIsSaving(true);
    try {
      if (kind === "category") {
        const created = await api.createCategory(form.name.trim());
        onCreatedCategory(created);
      } else {
        const created = await api.createCatalogueItem({
          kind,
          name: form.name.trim(),
          unit: form.unit,
          categoryId,
          labourType: kind === "labour" ? form.labourType.trim() : null,
        });
        onCreatedItem(kind, created);
      }
      onClose();
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Couldn't save that. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={isSaving ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-105 rounded-lg border bg-card text-card-foreground shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-semibold text-foreground">
              Create new {kind}
            </h2>
            <p className="text-xs leading-relaxed text-secondary-foreground">
              {isCategory
                ? "Categories group your recipes, such as Walls or Roofing."
                : `It is saved to your catalogue under ${categoryName} and added to this recipe straight away.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MdClose size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5 px-5 py-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="create-name" className="text-xs font-medium text-foreground">
              Name<span className="ml-0.5 text-destructive">*</span>
            </label>
            <input
              id="create-name"
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>

          {isCategory ? null : (
            <div className="flex flex-col gap-1">
              <label htmlFor="create-unit" className="text-xs font-medium text-foreground">
                Unit<span className="ml-0.5 text-destructive">*</span>
              </label>
              <select
                id="create-unit"
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a unit</option>
                {UNITS[kind].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The unit this is counted in, such as bricks in Nr or hours in hr.
              </p>
            </div>
          )}

          {needsLabourType ? (
            <div className="flex flex-col gap-1">
              <label htmlFor="create-labour-type" className="text-xs font-medium text-foreground">
                Labour type<span className="ml-0.5 text-destructive">*</span>
              </label>
              <input
                id="create-labour-type"
                type="text"
                placeholder="e.g. Trade"
                value={form.labourType}
                onChange={(e) => updateField("labourType", e.target.value)}
                className={inputClass}
              />
            </div>
          ) : null}

          {errorMessage ? (
            <p className="text-xs text-destructive">{errorMessage}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 cursor-pointer rounded-md border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="h-9 cursor-pointer rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCategory ? "Create category" : "Create and add"}
          </button>
        </div>
      </div>

      <LoadingModal show={isSaving} message="Saving" />
    </div>
  );
}