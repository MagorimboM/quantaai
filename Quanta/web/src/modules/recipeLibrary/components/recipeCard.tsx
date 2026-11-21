import { useState } from "react";
import { MdMoreVert, MdOutlineLayers } from "react-icons/md";
import { FiEdit2, FiArchive, FiTrash2, FiRotateCcw } from "react-icons/fi";
import { RecipeForm } from "@/modules/recipeLibrary/components/recipeForm";
import { archiveRecipe, deleteRecipe } from "@/modules/recipeLibrary/api/api";
import type {
  Category,
  Recipe,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import { ConfirmDeletionModal } from "@/modules/recipeLibrary/components/confirmDeletion";
import { LoadingModal } from "@/common/components/loadingModal";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

const menuItemClass =
  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#1C1917] transition-colors hover:bg-[#FFF1E7] cursor-pointer";

/**
 * One recipe in the library, with its menu:
 *  - Edit: change the name, description, category and ingredient quantities.
 *  - Archive: hide the recipe without losing it. Takeoffs that already use it
 *    keep working. In the archived view this becomes Restore.
 *  - Delete: remove it for good. Refused if a takeoff still uses the recipe
 *    (archive it instead), because deleting would strip the recipe from those
 *    takeoff lines.
 * The card never changes the list itself; it tells the page what happened
 * through `onUpdated` and `onRemoved`.
 */
export function RecipeCard({
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

  const materialCount = recipe.recipeMaterials.length;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#EFECE6] bg-white p-4 text-[#1C1917] shadow-[0_5px_15px_rgba(49,38,24,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#FFC2B1] hover:shadow-[0_8px_22px_rgba(112,66,43,0.08)]">
      <div className="flex items-center justify-between gap-2">
        <span className="max-w-[65%] truncate rounded-md bg-[#FFE9DF] px-2 py-1 text-[11px] font-bold tracking-wide text-[#BD4D32]">
          {recipe.categoryName}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716C]">
            <span className="text-[#A8A29E]">Unit</span>
            <span className="rounded-md border border-[#E7E3DC] bg-white px-2 py-0.5 text-[#44403C]">
              {recipe.recipeUnit}
            </span>
          </span>

          <div className="relative">
            <button
              title="recipe-actions-toggle"
              aria-label="Recipe actions"
              onClick={() => setShowMenu((prev) => !prev)}
              className="cursor-pointer rounded-lg p-1 text-[#A8A29E] transition-colors hover:bg-[#FFF1E7] hover:text-[#57534E]"
            >
              <MdMoreVert size={18} />
            </button>
            {showMenu ? (
              <div
                title="recipe-action-option"
                className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-[#EFECE6] bg-white p-1 shadow-[0_12px_30px_rgba(49,38,24,0.12)]"
              >
                {!isArchivedView ? (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditForm(true);
                    }}
                    className={menuItemClass}
                  >
                    <FiEdit2 size={14} />
                    Edit
                  </button>
                ) : null}
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
      </div>

      <h3 className="mt-3 text-sm font-bold leading-snug tracking-tight text-[#292524]">
        {recipe.recipeName}
      </h3>

      {recipe.recipeDescription ? (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#78716C]">
          {recipe.recipeDescription}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between border-t border-[#EDE8E1] pt-3 mt-4">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716C]">
          <MdOutlineLayers size={14} className="text-[#A8A29E]" />
          {materialCount} material{materialCount === 1 ? "" : "s"}
        </span>
        <span className="text-[11px] font-medium text-[#A8A29E]">
          Per {recipe.recipeUnit}
        </span>
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
    </div>
  );
}