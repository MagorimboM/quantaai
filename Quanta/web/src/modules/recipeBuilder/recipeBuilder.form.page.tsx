import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  getRecipeCategories,
  getSiteConditions,
  searchMaterials,
  createNewRecipe,
} from "@/modules/recipeBuilder/api/api";
import type {
  Category,
  MaterialSearchResult,
  SiteCondition,
} from "@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts";
import { MaterialSearchResultsModal } from "@/modules/recipeBuilder/components/MaterialSearchResultsModal";
import { RecipeSuccessModal } from "@/modules/recipeBuilder/components/RecipeSuccessModal";
import { LoadingModal } from "@/common/components/loadingModal";
import { getActiveScope } from "@/common/storage/activeScope";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

// TODO :: [feature] A recipe is also labour (hours) and overheads (equipment hire).
// The builder only adds materials today, so recipes made here have no labour or
// overhead lines, and takeoff totals for them show materials only.
// TODO :: [backend] The route needs a company, so recipes can't be created from a
// personal workspace yet, although recipes are meant to belong to the person.

const SEARCH_DELAY_MS = 400;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";
const sectionClass =
  "space-y-4 rounded-lg border bg-card p-5 text-card-foreground";
const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

function chipClass(active: boolean) {
  return active
    ? "rounded-md border border-primary bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors cursor-pointer"
    : "rounded-md border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-ring cursor-pointer";
}

type RecipeForm = {
  name: string;
  description: string;
  unit: string;
  categoryId: string;
};

// A material added to the recipe. The quantity stays text while the user types
// (so "0." or an empty box is fine) and becomes a number on save.
type SelectedIngredient = {
  materialId: string;
  name: string;
  unit: string;
  quantity: string;
};

/**
 * Builds a recipe: a named list of what goes into ONE unit of work, for
 * example "110mm Brick Wall, per m²: 60 bricks, 0.02 m³ mortar".
 *
 * The user names it, picks a recipe type (its category) and what the
 * quantities are per, optionally tags the ground condition it is for, then
 * searches the company's materials and sets each one's quantity. In a takeoff,
 * one measurement multiplies every line of the recipe.
 *
 * The recipe is saved for the active company. `onCreated` lets the page that
 * opened this refresh its list once the recipe exists.
 */
export function RecipeBuilderFormPage({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { companyId } = getActiveScope();

  const [form, setForm] = useState<RecipeForm>({
    name: "",
    description: "",
    unit: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteConditions, setSiteConditions] = useState<SiteCondition[]>([]);
  const [siteConditionId, setSiteConditionId] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  // narrows the material search to one category (empty = all categories)
  const [searchCategoryId, setSearchCategoryId] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MaterialSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // The choices the form offers
  useEffect(() => {
    if (!companyId) return;
    const activeCompanyId = companyId;

    async function loadOptions() {
      try {
        const [loadedCategories, loadedSiteConditions] = await Promise.all([
          getRecipeCategories({ companyId: activeCompanyId }),
          getSiteConditions({ companyId: activeCompanyId }),
        ]);
        setCategories(loadedCategories);
        setSiteConditions(loadedSiteConditions);
      } catch {
        // apiClient already reports the failure; the choices stay empty
      }
    }

    loadOptions();
  }, [companyId]);

  // Searches the company's materials shortly after the user stops typing or
  // picks a category, and shows what was found. `cancelled` drops the answer to
  // an older search if a newer one has started, so results never show out of order.
  // The site condition is read when a search runs; changing it alone doesn't
  // start one, so it never pops the results open by itself.
  useEffect(() => {
    if (!companyId) return;
    if (!searchTerm.trim() && !searchCategoryId) return;
    const activeCompanyId = companyId;
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        const results = await searchMaterials({
          companyId: activeCompanyId,
          term: searchTerm.trim() || undefined,
          categoryId: searchCategoryId || undefined,
          siteConditionId: siteConditionId || undefined,
        });
        if (cancelled) return;
        setSearchResults(results);
        setShowSearchResults(true);
      } catch {
        // apiClient already reports the failure
      }
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [companyId, searchTerm, searchCategoryId]);

  function updateField(field: keyof RecipeForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addIngredient(material: MaterialSearchResult) {
    if (ingredients.some((item) => item.materialId === material.id)) return;

    setIngredients((prev) => [
      ...prev,
      {
        materialId: material.id,
        name: material.name,
        unit: material.unit,
        quantity: "",
      },
    ]);
  }

  function updateIngredientQuantity(materialId: string, quantity: string) {
    setIngredients((prev) =>
      prev.map((item) =>
        item.materialId === materialId ? { ...item, quantity } : item,
      ),
    );
  }

  function removeIngredient(materialId: string) {
    setIngredients((prev) =>
      prev.filter((item) => item.materialId !== materialId),
    );
  }

  // Returns what is missing, or null when the recipe is ready to save
  function validate(): string | null {
    if (!form.name.trim()) return "Give the recipe a name.";
    if (!form.categoryId) return "Choose a recipe type.";
    if (!form.unit.trim()) return "Say what the quantities are per, for example m².";
    if (ingredients.length === 0) return "Add at least one ingredient.";
    if (ingredients.some((item) => !(Number(item.quantity) > 0))) {
      return "Every ingredient needs a quantity above zero.";
    }
    return null;
  }

  async function handleSubmit() {
    if (!companyId) return;

    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await createNewRecipe({
        companyId,
        categoryId: form.categoryId,
        siteConditionId: siteConditionId || null,
        name: form.name.trim(),
        description: form.description.trim(),
        unit: form.unit.trim(),
        ingredients: ingredients.map((item) => ({
          materialId: item.materialId,
          quantity: Number(item.quantity),
        })),
      });
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Couldn't create the recipe. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Recipes belong to a company, so without one there is nothing to build into
  if (!companyId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-lg">
          <p className="text-sm text-muted-foreground">
            Select a company workspace to create a recipe.
          </p>
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl space-y-8 overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
        {/* Recipe details */}
        <div className={sectionClass}>
          <div className="flex flex-row items-center justify-between">
            <h2 className={sectionTitleClass}>Recipe Details</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg border p-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>
                Recipe name<span className="ml-0.5 text-destructive">*</span>
              </label>
              <input
                title="recipe-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. 110mm Brick Wall"
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>
                Recipe type<span className="ml-0.5 text-destructive">*</span>
              </label>
              <select
                title="recipe-types"
                value={form.categoryId}
                onChange={(e) => updateField("categoryId", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a type</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Description</label>
              <input
                title="recipe-description"
                type="text"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="What this recipe covers…"
                className={inputClass}
              />
            </div>
          </div>

          {/* Every ingredient quantity below is "per 1 of this unit" */}
          <div>
            <label className={labelClass}>
              Quantities are per<span className="ml-0.5 text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                title="recipe-unit-measure"
                type="text"
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                placeholder="m²"
                className="w-28 rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">of output</span>
            </div>
          </div>
        </div>

        {/* Site conditions */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Site Conditions</h2>
          <p className="text-xs text-muted-foreground">
            Tag which ground this recipe is built for. Leave it untagged for a
            general recipe. With a condition chosen, materials made for that
            ground can be added as well as general ones.
          </p>

          <div
            title="site-conditions-options"
            className="flex flex-wrap gap-2 rounded-md border border-dashed p-4"
          >
            {siteConditions.length > 0 ? (
              siteConditions.map((condition) => (
                <button
                  key={condition.id}
                  onClick={() =>
                    setSiteConditionId((prev) =>
                      prev === condition.id ? "" : condition.id,
                    )
                  }
                  className={chipClass(siteConditionId === condition.id)}
                >
                  {condition.name}
                </button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No site conditions available.
              </span>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div title="add-materials" className={sectionClass}>
          <h2 className={sectionTitleClass}>Ingredients</h2>

          {/* Narrow the search to one category; click again to clear */}
          <div title="material-category" className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSearchCategoryId((prev) =>
                    prev === category.id ? "" : category.id,
                  )
                }
                className={chipClass(searchCategoryId === category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <input
            title="search-material"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search materials by name…"
            className={inputClass}
          />

          <div
            title="show-material-output"
            className="flex flex-col gap-2 rounded-md border border-dashed p-4"
          >
            {ingredients.length > 0 ? (
              ingredients.map((item) => (
                <div
                  key={item.materialId}
                  className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                >
                  <span className="truncate text-sm text-foreground">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      title="material-quantity"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) =>
                        updateIngredientQuantity(item.materialId, e.target.value)
                      }
                      className="w-20 rounded-md border border-input bg-background px-2 py-1 text-right font-mono text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <span className="w-10 font-mono text-[10px] text-muted-foreground">
                      {item.unit}
                    </span>
                    <button
                      onClick={() => removeIngredient(item.materialId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Search for a material above and click it to add it here.
              </p>
            )}
          </div>
        </div>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Add new Recipe
          </button>
        </div>
      </div>

      <MaterialSearchResultsModal
        show={showSearchResults}
        results={searchResults}
        addedIds={ingredients.map((item) => item.materialId)}
        onClose={() => setShowSearchResults(false)}
        onAdd={addIngredient}
      />

      <LoadingModal show={isSaving} message="Creating your recipe..." />

      <RecipeSuccessModal
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onCreated?.();
          onClose();
        }}
      />
    </div>
  );
}