import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { MdAdd, MdCheck } from "react-icons/md";
import type {
  NewRecipeClass,
  RecipeClassOption,
} from "@/modules/recipeLibrary/contracts/createRecipe.types";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

// The same limit the backend checks: the name sits on a small chip
const MAX_CLASS_NAME = 40;

const inputClass =
  "h-9 w-full rounded-lg border border-[#EFECE6] bg-[#FAF8F5] px-2.5 text-sm text-[#1C1917] outline-none placeholder:text-[#78716C] focus:border-[#FF6B4A] focus:bg-white focus:ring-[3px] focus:ring-[#FFF4EE]";

function chipClass(active: boolean) {
  return `inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "border-[#FF6B4A] bg-[#FFF4EE] text-[#E95333]"
      : "border-[#EFECE6] bg-white text-[#57534E] hover:border-[#FFB6A5]"
  }`;
}

const addChipClass =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-[#FFB6A5] px-2.5 py-1.5 text-xs font-medium text-[#FF6B4A] transition-colors hover:bg-[#FFF4EE]";

// Adds the id if it is missing, removes it if it is there
function toggle(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((each) => each !== id) : [...ids, id];
}

// The words that change between the two kinds of class
type ClassKind = "building" | "site";
const KIND_TEXT: Record<
  ClassKind,
  { label: string; namePlaceholder: string; descriptionPlaceholder: string }
> = {
  building: {
    label: "building class",
    namePlaceholder: "Name, e.g. Residential",
    descriptionPlaceholder: "Short description, e.g. Houses (NCC Class 1)",
  },
  site: {
    label: "site class",
    namePlaceholder: "Name, e.g. Class M-D",
    descriptionPlaceholder: "Short description, e.g. Deep movement",
  },
};

/**
 * The two small fields for adding a building class or a site class. They are
 * plain fields, not a <form>, so pressing Enter saves only the class and not
 * the whole recipe. Escape closes them.
 */
function NewClassFields({
  kind,
  onCreate,
  onCreated,
  onClose,
}: {
  kind: ClassKind;
  onCreate: (newClass: NewRecipeClass) => Promise<RecipeClassOption>;
  onCreated: (created: RecipeClassOption) => void;
  onClose: () => void;
}) {
  const text = KIND_TEXT[kind];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim() !== "" && description.trim() !== "" && !isSaving;

  async function save() {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);
    try {
      const created = await onCreate({
        name: name.trim(),
        description: description.trim(),
      });
      onCreated(created);
      onClose();
    } catch (caught) {
      setError(
        apiErrorMessage(caught, `Couldn't add the ${text.label}. Please try again.`),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <div
      role="group"
      aria-label={`New ${text.label}`}
      className="mt-1 flex flex-col gap-2 rounded-lg border border-[#EFECE6] bg-[#FAF8F5] p-2.5"
    >
      <span className="text-xs font-semibold text-[#1C1917]">New {text.label}</span>
      <input
        type="text"
        aria-label={`${text.label} name`}
        placeholder={text.namePlaceholder}
        value={name}
        maxLength={MAX_CLASS_NAME}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className={inputClass}
        autoFocus
      />
      <input
        type="text"
        aria-label={`${text.label} description`}
        placeholder={text.descriptionPlaceholder}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        className={inputClass}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onClose}
          className="h-8 cursor-pointer rounded-lg border border-[#EFECE6] bg-white px-3 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#FFF4EE]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="h-8 cursor-pointer rounded-lg bg-[#FF6B4A] px-3 text-xs font-medium text-white transition-colors hover:bg-[#F25C3C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}

/**
 * One group of chips (building classes or site classes) with its "Add" chip.
 * When the user has none yet, it says so and offers to add the first one.
 */
function ClassGroup({
  kind,
  title,
  hint,
  required,
  options,
  selectedIds,
  onChangeSelectedIds,
  onCreate,
  onCreated,
  startAdding,
}: {
  kind: ClassKind;
  title: string;
  hint?: string;
  required: boolean;
  options: RecipeClassOption[];
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  onCreate?: (newClass: NewRecipeClass) => Promise<RecipeClassOption>;
  onCreated: (created: RecipeClassOption) => void;
  // open the add fields straight away (used when a required list is empty)
  startAdding: boolean;
}) {
  const text = KIND_TEXT[kind];
  const [isAdding, setIsAdding] = useState(startAdding && onCreate !== undefined);

  // The list finished loading empty: open the add fields for a required group
  useEffect(() => {
    if (startAdding && onCreate) setIsAdding(true);
  }, [startAdding, onCreate]);

  const isEmpty = options.length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#1C1917]">
        {title}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        {hint ? <span className="font-normal text-[#78716C]"> {hint}</span> : null}
      </span>

      {isEmpty ? (
        <p className="text-xs text-[#78716C]">
          {onCreate
            ? `You don't have any ${text.label}es yet. Add your first one${required ? " to save this recipe" : ""}.`
            : `You don't have any ${text.label}es yet.`}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {options.map((item) => {
          const active = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              title={item.description || undefined}
              onClick={() => onChangeSelectedIds(toggle(selectedIds, item.id))}
              className={chipClass(active)}
            >
              {active ? <MdCheck size={12} /> : null}
              {item.name}
            </button>
          );
        })}

        {onCreate && !isAdding ? (
          <button type="button" onClick={() => setIsAdding(true)} className={addChipClass}>
            <MdAdd size={12} />
            Add {text.label}
          </button>
        ) : null}
      </div>

      {onCreate && isAdding ? (
        <NewClassFields
          kind={kind}
          onCreate={onCreate}
          onCreated={onCreated}
          onClose={() => setIsAdding(false)}
        />
      ) : null}
    </div>
  );
}

/**
 * "Where it applies" in the Create recipe form: the building classes (at least
 * one) and site classes (optional) the new recipe suits. Click a chip to
 * choose it, and click it again to clear it.
 *
 * Each group has an "Add" chip when the screen can create that kind of class.
 * A new class is added to the list and chosen straight away. If the user has
 * no building classes at all, the add fields open by themselves, because the
 * recipe can't be saved without one.
 */
export function RecipeClassFields({
  buildingClasses,
  siteClasses,
  buildingClassIds,
  siteClassIds,
  isLoading,
  onChangeBuildingClassIds,
  onChangeSiteClassIds,
  onCreateBuildingClass,
  onBuildingClassCreated,
  onCreateSiteClass,
  onSiteClassCreated,
}: {
  buildingClasses: RecipeClassOption[];
  siteClasses: RecipeClassOption[];
  buildingClassIds: string[];
  siteClassIds: string[];
  isLoading: boolean;
  onChangeBuildingClassIds: (ids: string[]) => void;
  onChangeSiteClassIds: (ids: string[]) => void;
  onCreateBuildingClass?: (newClass: NewRecipeClass) => Promise<RecipeClassOption>;
  onBuildingClassCreated: (created: RecipeClassOption) => void;
  onCreateSiteClass?: (newClass: NewRecipeClass) => Promise<RecipeClassOption>;
  onSiteClassCreated: (created: RecipeClassOption) => void;
}) {
  if (isLoading) {
    return <p className="text-xs text-[#78716C]">Loading classes…</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ClassGroup
        kind="building"
        title="Building classes"
        required
        options={buildingClasses}
        selectedIds={buildingClassIds}
        onChangeSelectedIds={onChangeBuildingClassIds}
        onCreate={onCreateBuildingClass}
        onCreated={onBuildingClassCreated}
        startAdding={buildingClasses.length === 0}
      />
      <ClassGroup
        kind="site"
        title="Site classes"
        hint="(empty = any site)"
        required={false}
        options={siteClasses}
        selectedIds={siteClassIds}
        onChangeSelectedIds={onChangeSiteClassIds}
        onCreate={onCreateSiteClass}
        onCreated={onSiteClassCreated}
        startAdding={false}
      />
    </div>
  );
}