import { RecipeCard } from "@/modules/recipeLibrary/components/recipeCard";
import type {
  Category,
  Recipe,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// The recipes of the current page as cards, a placeholder grid while they load,
// or a message when there are none.
export function RecipeList({
  recipeList,
  isLoading,
  isArchivedView,
  companyId,
  categories,
  onRecipeUpdated,
  onRecipeRemoved,
}: {
  recipeList: Recipe[];
  isLoading: boolean;
  isArchivedView: boolean;
  companyId: string;
  categories: Category[];
  onRecipeUpdated: (recipe: Recipe) => void;
  onRecipeRemoved: (recipeId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-[#F0EDE8] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-2/3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[#F5F5F4]" />
                <div className="h-3 w-1/2 rounded bg-[#F5F5F4]" />
              </div>
              <div className="h-6 w-6 rounded bg-[#F5F5F4]" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-[#F5F5F4]" />
              <div className="h-3 w-5/6 rounded bg-[#F5F5F4]" />
            </div>
            <div className="mt-3 h-3 w-1/3 rounded bg-[#F5F5F4]" />
          </div>
        ))}
      </div>
    );
  }

  if (recipeList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#F0EDE8] bg-[#FAFAF9] py-16">
        <p className="text-sm font-medium text-[#1C1917]">
          {isArchivedView ? "No archived recipes" : "No recipes found"}
        </p>
        <p className="text-xs text-[#78716C]">
          {isArchivedView
            ? "Recipes you archive appear here."
            : "Try a different search term or category."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipeList.map((recipe) => (
        <RecipeCard
          key={recipe.recipeId}
          recipe={recipe}
          companyId={companyId}
          categories={categories}
          isArchivedView={isArchivedView}
          onUpdated={onRecipeUpdated}
          onRemoved={onRecipeRemoved}
        />
      ))}
    </div>
  );
}