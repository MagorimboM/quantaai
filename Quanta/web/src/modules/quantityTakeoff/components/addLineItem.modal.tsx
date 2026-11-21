import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdAutoAwesome,
  MdChevronRight,
  MdOutlineDescription,
} from "react-icons/md";
import {
  addLineItem,
  getRecipeOptions,
} from "@/modules/quantityTakeoff/api/api";
import type {
  GetBillOfQuantsResponse,
  RecipeOption,
} from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";
import { RecipeResultCard } from "@/modules/quantityTakeoff/components/rescipeResults.card";
import { RecipePreview } from "@/modules/quantityTakeoff/components/recipePreview";
import {
  AddToTakeoffBar,
  AddToTakeoffForm,
} from "@/modules/quantityTakeoff/components/addToTakeOffForm";
import { CreateRecipeModal } from "@/modules/quantityTakeoff/components/createRecipe.modal";
import {
  glowBorder,
  kicker,
  panelCard,
} from "@/modules/quantityTakeoff/components/takeoff.styles";
import { LoadingModal } from "@/common/components/loadingModal";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

/**
 * Adds lines to the takeoff, always on screen (this replaces the old
 * AddLineItemModal). It renders TWO columns, the recipe library and the
 * calculator, so the page can put them in its grid next to the takeoff sheet.
 *
 * A takeoff line is a recipe multiplied by one measurement, so those are the
 * only two things that must be chosen. The user's recipes are loaded once and
 * searched/filtered in the browser, so typing gives an instant preview with no
 * request per keystroke.
 * TODO :: [backend] Search and filter on the server once libraries grow large
 * enough that sending every recipe at once is slow.
 *
 * `onAdded` receives the new line exactly as the takeoff lists it, so the page
 * can show it straight away without reloading. After an add the recipe stays
 * selected and the fields clear, ready for the next measurement.
 */
export function AddLineItemWorkspace({
  companyId,
  projectId,
  onAdded,
}: {
  companyId: string;
  projectId: string;
  onAdded: (lineItem: GetBillOfQuantsResponse) => void;
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
  const [justAdded, setJustAdded] = useState<boolean>(false);
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

  // The green "Added" state lasts a moment, then the button goes back to normal
  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  // The filter chips come from the recipes themselves, so a category with no
  // recipes never appears
  const categories = useMemo(() => {
    const byId = new Map<string, string>();
    for (const recipe of recipes)
      byId.set(recipe.category.id, recipe.category.name);
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes]);

  const visibleRecipes = useMemo(() => {
    const term = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const inCategory =
        categoryId === "all" || recipe.category.id === categoryId;
      const inText =
        !term ||
        [recipe.name, recipe.description ?? "", recipe.category.name].some(
          (text) => text.toLowerCase().includes(term),
        );
      return inCategory && inText;
    });
  }, [recipes, query, categoryId]);

  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? null;
  const activeCategoryName =
    categories.find((category) => category.id === categoryId)?.name ?? null;

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
    setJustAdded(false);
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
      setMeasurement("");
      setLocation("");
      setNotes("");
      setJustAdded(true);
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
    const message = "py-10 text-center text-sm text-[#78716C]";
    if (isLoading) return <p className={message}>Loading recipes…</p>;
    if (recipes.length === 0) {
      return (
        <p className={message}>
          You have no recipes yet. Press New to make your first one.
        </p>
      );
    }
    if (visibleRecipes.length === 0) {
      return (
        <p className={message}>
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
      {/* Column 1: recipe library */}
      <aside className={`${panelCard} p-5`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={kicker}>Library</span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#1C1917]">
              Recipes
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateRecipe(true)}
            className="flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-[#FFD1C4] bg-[#FFF6F1] px-2.5 text-xs font-semibold text-[#D45336] transition-colors hover:bg-[#FFEDE4]"
          >
            <MdAdd size={14} />
            New
          </button>
        </div>

        <div
          style={glowBorder}
          className="mt-5 flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3 shadow-[0_5px_18px_rgba(236,112,85,0.10)] focus-within:shadow-[0_0_0_3px_rgba(255,107,74,0.10),0_8px_22px_rgba(236,112,85,0.14)]"
        >
          <MdAutoAwesome size={17} className="shrink-0 text-[#E36551]" />
          <input
            type="text"
            aria-label="Search recipes"
            placeholder="Search recipes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#292524] outline-none placeholder:text-[#9E9690]"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {[{ id: "all", name: "All" }, ...categories].map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={`h-7 cursor-pointer rounded-full border px-3 text-xs font-semibold transition-colors ${
                categoryId === category.id
                  ? "border-[#FFD6C7] bg-[#FFF0E9] text-[#C44E31]"
                  : "border-[#EEEAE4] bg-[#FAF9F7] text-[#78716C] hover:border-[#FFD6C7]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <nav
          aria-label="Breadcrumb"
          className="mt-4 mb-2.5 flex items-center gap-1 px-0.5 text-xs text-[#AAA29B]"
        >
          <span>All recipes</span>
          {activeCategoryName ? (
            <>
              <MdChevronRight size={14} />
              <strong className="font-semibold text-[#5F5955]">
                {activeCategoryName}
              </strong>
            </>
          ) : null}
        </nav>

        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 pb-1">
          {renderResults()}
        </div>

        <p className="mt-3 shrink-0 border-t border-[#F0EDE9] pt-3 text-xs text-[#AAA29B]">
          {visibleRecipes.length}{" "}
          {visibleRecipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </aside>

      {/* Column 2: calculator */}
      <section className={panelCard}>
        {selected ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addToTakeoff();
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <RecipePreview recipe={selected} measurement={validMeasurement}>
                <AddToTakeoffForm
                  unit={selected.unit}
                  measurement={measurement}
                  location={location}
                  notes={notes}
                  errorMessage={errorMessage}
                  onMeasurementChange={setMeasurement}
                  onLocationChange={setLocation}
                  onNotesChange={setNotes}
                />
              </RecipePreview>
            </div>
            <AddToTakeoffBar
              summary={`Adds ${selected.recipeMaterials.length} materials · ${selected.recipeLabour.length} labour · ${selected.recipeOverheads.length} overheads`}
              canAdd={validMeasurement !== null && !isAdding}
              justAdded={justAdded}
            />
          </form>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFF1E9] text-[#E36551]">
              <MdOutlineDescription size={26} />
            </span>
            <p className="mt-1 text-sm font-semibold text-[#1C1917]">
              Select a recipe to start
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-[#78716C]">
              You’ll see every material, labour and overhead it contains, and
              the totals update as you type a measurement.
            </p>
          </div>
        )}
      </section>

      <LoadingModal show={isAdding} message="Adding line item" />

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