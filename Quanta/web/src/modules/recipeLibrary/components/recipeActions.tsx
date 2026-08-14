import { useState } from "react";
import { RecipeForm } from "@/modules/recipeLibrary/components/recipeForm";
import type { Materials, SetRecipeListState } from "@/modules/recipeLibrary/contracts/types";
import { FiEdit2, FiArchive, FiTrash2 } from "react-icons/fi";

// TODO :: archive recipe -> connect it to the backend
// TODO :: delete recipe -> connect it to the backend
// TODO :: edit recipe -> connect it to the backend
// TODO :: asks for user confirmation before deleting the recipe -> show deletion confirmation -> remove it from the recipe list
// TODO :: show confirmation when recipe is archived, remove it from the recipe list. 


export function RecipeActions({
  recipeId,
  categoryId,
  recipeName,
  categoryName,
  recipeDescription,
  tags,
  materials,
  setRecipeListState,
}: {
  recipeId: string;
  categoryId: string;
  recipeName: string;
  categoryName: string;
  recipeDescription: string;
  tags: string[];
  materials: Materials[];
  setRecipeListState: SetRecipeListState;
}) {
  const [showRecipeForm, setShowRecipeForm] = useState<boolean>(false);

  function toggleRecipeForm() {
    setShowRecipeForm((prev) => !prev);
  }

  async function archiveRecipe({
    recipeId,
    categoryId,
  }: {
    recipeId: string;
    categoryId: string;
  }) {
    // TODO: send a request to the backend (no archive endpoint exists in api.ts yet)
    // get confirmation report,
    // trigger a re-render or label the recipe as archived...
  }

  async function deleteRecipe({
    recipeId,
    categoryId,
  }: {
    recipeId: string;
    categoryId: string;
  }) {
    // TODO: send a request to the backend (no delete endpoint exists in api.ts yet)
    // confirmed deletion
    // remove the recipe from the list.
  }

  return (
    <>
      {showRecipeForm ? (
        <RecipeForm
          recipeId={recipeId}
          categoryId={categoryId}
          recipeName={recipeName}
          categoryName={categoryName}
          recipeDescription={recipeDescription}
          tags={tags}
          materials={materials}
          setRecipeListState={setRecipeListState}
          showRecipeForm={toggleRecipeForm}
        />
      ) : (
        <div title="recipe-action-option" className="flex flex-col">
          <button
            onClick={toggleRecipeForm}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
          >
            <FiEdit2 size={14} />
            Edit
          </button>
          <button
            onClick={() => archiveRecipe({ recipeId, categoryId })}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
          >
            <FiArchive size={14} />
            Archive
          </button>
          <button
            onClick={() => deleteRecipe({ recipeId, categoryId })}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
          >
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </>
  );
}