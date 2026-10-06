import { useState } from "react";
import { MdClose } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import { updateRecipe } from "@/modules/recipeLibrary/api/api";
import type {
  Category,
  Recipe,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import { LoadingModal } from "@/common/components/loadingModal";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

const ALL_CATEGORIES_ID = "all";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

// An ingredient line being edited. The quantity stays text while the user types
// and becomes a number on save.
type EditableLine = {
  id: string;
  name: string;
  unit: string;
  quantity: string;
};

/**
 * Edits an existing recipe: its name, description and category, and how much of
 * each material goes into one unit of it. Lines can be removed here but not
 * added, and a material's own name and unit can't be changed: those belong to
 * the material, not the recipe. The recipe's unit (m², m³...) is fixed too,
 * because changing it would change what every quantity means.
 * TODO :: [feature] adding a material to an existing recipe needs the same
 * search picker the recipe builder has.
 *
 * Nothing changes until Save: Cancel (or the cross) throws the edits away.
 */
export function RecipeForm({
  recipe,
  companyId,
  categories,
  onSaved,
  onClose,
}: {
  recipe: Recipe;
  companyId: string;
  categories: Category[];
  onSaved: (updated: Recipe) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState<string>(recipe.recipeName);
  const [description, setDescription] = useState<string>(
    recipe.recipeDescription,
  );
  const [categoryId, setCategoryId] = useState<string>(recipe.categoryId);
  const [lines, setLines] = useState<EditableLine[]>(
    recipe.recipeMaterials.map((material) => ({
      id: material.id,
      name: material.name,
      unit: material.unit,
      quantity: String(material.quantity),
    })),
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateQuantity(lineId: string, quantity: string) {
    setLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, quantity } : line)),
    );
  }

  function removeLine(lineId: string) {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
  }

  // Returns what is wrong, or null when the recipe is ready to save
  function validate(): string | null {
    if (!name.trim()) return "Give the recipe a name.";
    if (!categoryId) return "Choose a category.";
    if (lines.length === 0) return "A recipe needs at least one material.";
    if (lines.some((line) => !(Number(line.quantity) > 0))) {
      return "Every material needs a quantity above zero.";
    }
    return null;
  }

  async function save() {
    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const updated = await updateRecipe({
        companyId,
        recipeId: recipe.recipeId,
        name: name.trim(),
        description: description.trim(),
        categoryId,
        ingredients: lines.map((line) => ({
          id: line.id,
          quantity: Number(line.quantity),
        })),
      });
      onSaved(updated);
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Couldn't save the recipe. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  // "All" is a filter in the library, not a category a recipe can belong to
  const choosableCategories = categories.filter(
    (category) => category.categoryId !== ALL_CATEGORIES_ID,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-lg">
        <div className="flex items-center justify-between border-b pb-3">
          <h1 className="text-base font-semibold text-foreground">
            Edit Recipe
          </h1>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Recipe Name</label>
            <input
              title="recipe-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              {choosableCategories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <input
              title="recipe-description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Materials (quantity per 1 {recipe.recipeUnit})
            </label>
            <ul className="space-y-2">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <span className="flex-1 truncate text-sm text-foreground">
                    {line.name}
                  </span>
                  <input
                    title="recipe-material-quantity-input"
                    type="number"
                    min="0"
                    step="any"
                    value={line.quantity}
                    onChange={(e) => updateQuantity(line.id, e.target.value)}
                    className={`${inputClass} w-24 text-right`}
                  />
                  <span className="w-10 font-mono text-[10px] text-muted-foreground">
                    {line.unit}
                  </span>
                  <button
                    onClick={() => removeLine(line.id)}
                    aria-label={`Remove ${line.name}`}
                    className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive cursor-pointer"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-md border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/70 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>

      <LoadingModal show={isSaving} message="Saving recipe..." />
    </div>
  );
}