import { useState } from "react";
import { RecipeActions } from "@/modules/recipeLibrary/components/recipeActions";
import type {
  Materials,
  SetRecipeListState,
} from "@/modules/recipeLibrary/contracts/types";
import { MdMoreVert } from "react-icons/md";

export function RecipeCard({
  categoryId,
  recipeName,
  recipeId,
  categoryName,
  recipeDescription,
  tags,
  materials,
  setRecipeListState,
}: {
  categoryId: string;
  recipeId: string;
  recipeName: string;
  categoryName: string;
  recipeDescription: string;
  tags: string[];
  materials: Materials[];
  setRecipeListState: SetRecipeListState;
}) {
  const [showRecipeActions, setShowRecipeActions] = useState<boolean>(false);

  return (
    <div className="relative rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div title="recipe-info">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-sm font-semibold text-zinc-900">
              {recipeName}
            </h1>
            <h2 className="text-xs text-zinc-500">{categoryName}</h2>
          </div>
          <div title="recipe-actions-container" className="relative">
            <button
              title="recipe-actions-toggle"
              onClick={() => setShowRecipeActions((prev) => !prev)}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              <MdMoreVert size={18} />
            </button>
            {showRecipeActions ? (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-zinc-200 bg-white p-1 shadow-md">
                <RecipeActions
                  recipeId={recipeId}
                  categoryId={categoryId}
                  recipeName={recipeName}
                  categoryName={categoryName}
                  recipeDescription={recipeDescription}
                  tags={tags}
                  materials={materials}
                  setRecipeListState={setRecipeListState}
                />
              </div>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-600">{recipeDescription}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          {materials.length} materials
        </p>
      </div>
    </div>
  );
}
