import { useEffect, useMemo, useState } from "react";
import { MdAdd, MdClose, MdOutlineDescription, MdOutlineSearch } from "react-icons/md";
import { addLineItem, getRecipeOptions } from "@/modules/quantityTakeoff/api/api";
import type {
  GetBillOfQuantsResponse,
  RecipeOption,
} from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import { RecipeResultCard } from "@/modules/quantityTakeoff/components/rescipeResults.card";
import { RecipePreview } from "@/modules/quantityTakeoff/components/recipePreview";
import { AddToTakeoffForm } from "@/modules/quantityTakeoff/components/addToTakeOffForm";
import { CreateRecipeModal } from "@/modules/quantityTakeoff/components/createRecipe.modal";
import { LoadingModal } from "@/common/components/loadingModal";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

/**
 * Adds one line to the takeoff: find a recipe, read what it contains, enter
 * the measurement, add. A takeoff line is a recipe multiplied by one
 * measurement, so those are the only two things that must be chosen.
 *
 * The user's recipes are loaded once and searched/filtered in the browser, so
 * typing gives an instant preview with no request per keystroke.
 * TODO :: [backend] Search and filter on the server once libraries grow large
 * enough that sending every recipe at once is slow.
 *
 * `onAdded` receives the new line exactly as the takeoff lists it, so the page
 * can show it straight away without reloading.
 */
export function AddLineItemModal({
  companyId,
  projectId,
  onAdded,
  onClose,
}: {
  companyId: string;
  projectId: string;
  onAdded: (lineItem: GetBillOfQuantsResponse) => void;
  onClose: () => void;
}) {
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  // "all" means no category filter
  const [categoryId, setCategoryId] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [measurement, setMeasurement] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [showCreateRecipe, setShowCreateRecipe] = useState<boolean>(false);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecipes() {
      try {
        setRecipes(await getRecipeOptions({ companyId, projectId }));
      } catch {
        // apiClient already reports the failure; the list stays empty
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipes();
  }, [companyId, projectId]);

  // The filter chips come from the recipes themselves, so a category with no
  // recipes never appears
  const categories = useMemo(() => {
    const byId = new Map<string, string>();
    for (const recipe of recipes) byId.set(recipe.category.id, recipe.category.name);
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes]);

  const visibleRecipes = useMemo(() => {
    const term = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const inCategory = categoryId === "all" || recipe.category.id === categoryId;
      const inText =
        !term ||
        [recipe.name, recipe.description ?? "", recipe.category.name].some(
          (text) => text.toLowerCase().includes(term),
        );
      return inCategory && inText;
    });
  }, [recipes, query, categoryId]);

  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? null;

  // null while the box is empty or not a number above zero
  const parsedMeasurement = parseFloat(measurement);
  const validMeasurement =
    !Number.isNaN(parsedMeasurement) && parsedMeasurement > 0
      ? parsedMeasurement
      : null;

  // A recipe made in the "Create recipe" form joins the list and is selected,
  // with the search and filter cleared so it is certain to be on screen
  function recipeCreated(recipe: RecipeOption) {
    setRecipes((prev) =>
      [...prev, recipe].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setQuery("");
    setCategoryId("all");
    selectRecipe(recipe.id);
  }

  function selectRecipe(id: string) {
    setSelectedId(id);
    setErrorMessage(null);
  }

  async function addToTakeoff() {
    if (!selected || validMeasurement === null || isAdding) return;

    setErrorMessage(null);
    setIsAdding(true);
    try {
      const created = await addLineItem({
        companyId,
        projectId,
        recipeId: selected.id,
        measurement: validMeasurement,
        description: location.trim(),
        notes: notes.trim() === "" ? null : notes.trim(),
      });
      onAdded(created);
      onClose();
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Couldn't add the line item. Please try again."),
      );
    } finally {
      setIsAdding(false);
    }
  }

  // Why the list is empty decides what the message says
  function renderResults() {
    if (isLoading) {
      return <p className="py-10 text-center text-sm text-muted-foreground">Loading recipes…</p>;
    }
    if (recipes.length === 0) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          You have no recipes yet. Press Create recipe to make your first one.
        </p>
      );
    }
    if (visibleRecipes.length === 0) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No recipes match your search. Try another word or clear the filter.
        </p>
      );
    }
    return visibleRecipes.map((recipe) => (
      <RecipeResultCard
        key={recipe.id}
        recipe={recipe}
        isSelected={recipe.id === selectedId}
        onSelect={() => selectRecipe(recipe.id)}
      />
    ));
  }

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      // A stray click must not close the modal while the line is being added
      onClick={isAdding ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-160 max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg"
      >
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Add line item
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick a recipe, check what it contains, then enter the measurement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateRecipe(true)}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
            >
              <MdAdd size={14} className="text-primary" />
              Create recipe
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer rounded-md border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Left: search, category filter, results */}
          <div className="flex w-95 shrink-0 flex-col border-r">
            <div className="flex flex-col gap-2.5 p-4 pb-2.5">
              <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-2.5 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                <MdOutlineSearch size={18} className="text-muted-foreground" />
                <input
                  type="text"
                  aria-label="Search recipes"
                  placeholder="Search recipes by name or description…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[{ id: "all", name: "All" }, ...categories].map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    className={`h-7 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors ${
                      categoryId === category.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                {visibleRecipes.length}{" "}
                {visibleRecipes.length === 1 ? "recipe" : "recipes"}
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
              {renderResults()}
            </div>
          </div>

          {/* Right: preview of the chosen recipe, then the add form */}
          <div className="flex min-w-0 flex-1 flex-col">
            {selected ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  <RecipePreview
                    recipe={selected}
                    measurement={validMeasurement}
                  />
                </div>
                <AddToTakeoffForm
                  unit={selected.unit}
                  measurement={measurement}
                  location={location}
                  notes={notes}
                  summary={`Adds ${selected.recipeMaterials.length} materials · ${selected.recipeLabour.length} labour · ${selected.recipeOverheads.length} overheads`}
                  canAdd={validMeasurement !== null && !isAdding}
                  errorMessage={errorMessage}
                  onMeasurementChange={setMeasurement}
                  onLocationChange={setLocation}
                  onNotesChange={setNotes}
                  onCancel={onClose}
                  onAdd={addToTakeoff}
                />
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
                <MdOutlineDescription size={32} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Select a recipe to preview it
                </p>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  You’ll see its description and every material, labour and
                  overhead before it goes on the takeoff.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoadingModal show={isAdding} message="Adding line item" />
    </div>

    {/* A sibling of the overlay above, not a child: a click inside it must not
        bubble up and close this modal behind it */}
    {showCreateRecipe ? (
      <CreateRecipeModal
        companyId={companyId}
        projectId={projectId}
        onCreated={recipeCreated}
        onClose={() => setShowCreateRecipe(false)}
      />
    ) : null}
    </>
  );
}