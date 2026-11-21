import { useState } from "react";
import { MdMoreVert, MdOutlineLayers } from "react-icons/md";
import { FiArchive, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { RecipeForm } from "@/modules/recipeLibrary/components/recipeForm";
import { archiveRecipe, deleteRecipe } from "@/modules/recipeLibrary/api/api";
import type {
  Category,
  Recipe,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import { getRecipeClassification } from "@/modules/recipeLibrary/contracts/recipeClassification";
import { ConfirmDeletionModal } from "@/modules/recipeLibrary/components/confirmDeletion";
import { LoadingModal } from "@/common/components/loadingModal";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

const menuItemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#1C1917] transition-colors hover:bg-[#FFF1E7]";

// Shown in the right-hand column when there is no recipe to show
export function EmptyRecipeDetail() {
  return (
    <aside className="panel flex min-h-0 flex-col items-center justify-center gap-2 p-8 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEEAE5] text-[#A69E97]">
        <MdOutlineLayers size={22} />
      </span>
      <p className="mt-1 text-[12px] font-bold">No recipe selected</p>
      <p className="text-[11px] text-[#A8A29E]">
        Select a recipe to see what goes into it.
      </p>
    </aside>
  );
}

/**
 * The selected recipe in full, with its actions:
 *  - Edit: change the name, description, category and ingredient quantities.
 *  - Archive: hide the recipe without losing it. Takeoffs that already use it
 *    keep working. In the archived view this becomes Restore.
 *  - Delete: remove it for good. Refused if a takeoff still uses the recipe
 *    (archive it instead), because deleting would strip the recipe from those
 *    takeoff lines.
 * The panel never changes the list itself; it tells the page what happened
 * through `onUpdated` and `onRemoved`. The page gives it a `key` of the recipe's
 * id, so choosing another recipe starts it fresh (menu and dialogs closed).
 *
 * TODO :: [feature] The design has an "Add component" button. The edit form
 * can't add materials yet (see RecipeForm), so it isn't shown.
 */
export function RecipeDetailPanel({
  recipe,
  companyId,
  categories,
  isArchivedView,
  onUpdated,
  onRemoved,
}: {
  recipe: Recipe;
  companyId: string;
  categories: Category[];
  isArchivedView: boolean;
  onUpdated: (recipe: Recipe) => void;
  onRemoved: (recipeId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  // Archives (or restores) the recipe, then it leaves the list being viewed
  async function toggleArchived() {
    setShowMenu(false);
    setIsArchiving(true);
    try {
      await archiveRecipe({
        companyId,
        recipeId: recipe.recipeId,
        archived: !isArchivedView,
      });
      onRemoved(recipe.recipeId);
    } catch {
      // apiClient already reports the failure; the recipe stays where it is
    } finally {
      setIsArchiving(false);
    }
  }

  // Run by the confirm dialog. Throwing keeps the dialog open and shows the
  // reason, for example "used by 3 takeoff lines".
  async function deleteThisRecipe() {
    try {
      await deleteRecipe({ companyId, recipeId: recipe.recipeId });
    } catch (error) {
      throw new Error(
        apiErrorMessage(error, "Couldn't delete the recipe. Please try again."),
      );
    }
    onRemoved(recipe.recipeId);
  }

  const materials = recipe.recipeMaterials;
  // The recipe's own building and site class (empty until the backend has them)
  const { building, site } = getRecipeClassification(recipe);

  return (
    <aside className="panel flex min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#EFECE6] bg-[#FCFBF9] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow truncate">{recipe.categoryName}</span>

          <div className="relative">
            <button
              type="button"
              title="recipe-actions-toggle"
              aria-label="Recipe actions"
              onClick={() => setShowMenu((prev) => !prev)}
              className="cursor-pointer rounded-lg p-1.5 text-[#A8A29E] transition hover:bg-white hover:text-[#57534E]"
            >
              <MdMoreVert size={18} />
            </button>
            {showMenu ? (
              <div
                title="recipe-action-option"
                className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-[#EFECE6] bg-white p-1 shadow-[0_12px_30px_rgba(49,38,24,0.12)]"
              >
                <button onClick={toggleArchived} className={menuItemClass}>
                  {isArchivedView ? (
                    <FiRotateCcw size={14} />
                  ) : (
                    <FiArchive size={14} />
                  )}
                  {isArchivedView ? "Restore" : "Archive"}
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className={`${menuItemClass} text-red-600`}
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex items-start justify-between gap-4">
          <h2 className="text-[17px] font-bold leading-[1.25] tracking-[-0.025em]">
            {recipe.recipeName}
          </h2>
          {!isArchivedView ? (
            <button
              type="button"
              onClick={() => setShowEditForm(true)}
              className="shrink-0 cursor-pointer rounded-lg border border-[#DDD8D0] bg-white px-3 py-1.5 text-[10px] font-bold text-[#57534E] transition hover:border-[#FF9A82] hover:text-[#E95333]"
            >
              Edit
            </button>
          ) : null}
        </div>

        {recipe.recipeDescription ? (
          <p className="mt-2 text-[11px] leading-relaxed text-[#78716C]">
            {recipe.recipeDescription}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="context-badge">{recipe.categoryName}</span>
          {building ? <span className="context-badge">{building.name}</span> : null}
          {site ? <span className="context-badge">{site.badge}</span> : null}
          <span className="context-badge">Unit: {recipe.recipeUnit}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold">Components &amp; Ratios</p>
            <p className="mt-0.5 text-[10px] text-[#A8A29E]">
              Quantities required per {recipe.recipeUnit}
            </p>
          </div>
          <span className="rounded-lg bg-[#F5F3EF] px-2 py-1 text-[9px] font-bold uppercase text-[#78716C]">
            {materials.length} item{materials.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-3 divide-y divide-[#F0EDE8]">
          {materials.map((material, index) => (
            <div
              key={material.id}
              className="flex min-h-[55px] items-center gap-3 py-2"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F8F6F2] text-[10px] font-bold text-[#A8A29E]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-[11px] font-semibold leading-[1.35] text-[#44403C]">
                {material.name}
              </span>
              <span className="shrink-0 rounded-lg bg-[#ECFDF5] px-2.5 py-1.5 text-[10px] font-bold text-[#059669]">
                {material.quantity.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}{" "}
                {material.unit} / {recipe.recipeUnit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showEditForm ? (
        <RecipeForm
          recipe={recipe}
          companyId={companyId}
          categories={categories}
          onSaved={(updated) => {
            onUpdated(updated);
            setShowEditForm(false);
          }}
          onClose={() => setShowEditForm(false)}
        />
      ) : null}

      {showDeleteConfirm ? (
        <ConfirmDeletionModal
          header="Delete recipe"
          message={`Delete "${recipe.recipeName}" for good? This cannot be undone. If you only want it out of the way, archive it instead.`}
          workingMessage="Deleting recipe"
          onConfirm={deleteThisRecipe}
          onClose={() => setShowDeleteConfirm(false)}
        />
      ) : null}

      <LoadingModal
        show={isArchiving}
        message={isArchivedView ? "Restoring recipe" : "Archiving recipe"}
      />
    </aside>
  );
}