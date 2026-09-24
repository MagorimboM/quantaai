import { RecipeCard } from "@/modules/recipeLibrary/components/recipeCard";
import type { Recipe } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import type { SetRecipeListState } from "@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts";

export function RecipeList({
  recipeList,
  setRecipeListState,
  isLoading,
}: {
  recipeList: Recipe[];
  setRecipeListState: SetRecipeListState;
  isLoading: boolean;
}) {
  if (isLoading === true) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-2/3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-200" />
                <div className="h-3 w-1/2 rounded bg-zinc-100" />
              </div>
              <div className="h-6 w-6 rounded bg-zinc-100" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-zinc-100" />
              <div className="h-3 w-5/6 rounded bg-zinc-100" />
            </div>
            <div className="mt-4 flex gap-1.5">
              <div className="h-5 w-12 rounded bg-zinc-100" />
              <div className="h-5 w-14 rounded bg-zinc-100" />
            </div>
            <div className="mt-3 h-3 w-1/3 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  if (recipeList.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-white py-16">
          <p className="text-sm font-medium text-zinc-700">No recipes found</p>
          <p className="text-xs text-zinc-400">
            Try a different search term or category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipeList.map((recipe) => (
        <RecipeCard
          key={recipe.recipeId}
          categoryId={recipe.categoryId}
          recipeId={recipe.recipeId}
          categoryName={recipe.categoryName}
          recipeDescription={recipe.recipeDescription}
          recipeName={recipe.recipeName}
          tags={recipe.recipeTags}
          materials={recipe.recipeMaterials}
          setRecipeListState={setRecipeListState}
        />
      ))}
    </div>
  );
}