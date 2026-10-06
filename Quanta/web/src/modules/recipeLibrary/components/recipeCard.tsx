import { useState } from "react";
import { MdMoreVert } from "react-icons/md";
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
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted cursor-pointer";

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

  return (
    <div className="relative rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            {recipe.recipeName}
          </h1>
          <h2 className="text-xs text-muted-foreground">
            {recipe.categoryName}
          </h2>
        </div>

        <div className="relative">
          <button
            title="recipe-actions-toggle"
            aria-label="Recipe actions"
            onClick={() => setShowMenu((prev) => !prev)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <MdMoreVert size={18} />
          </button>
          {showMenu ? (
            <div
              title="recipe-action-option"
              className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md"
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
                className={`${menuItemClass} text-destructive`}
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {recipe.recipeDescription ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {recipe.recipeDescription}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground">
        Per {recipe.recipeUnit} · {recipe.recipeMaterials.length} material
        {recipe.recipeMaterials.length === 1 ? "" : "s"}
      </p>

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