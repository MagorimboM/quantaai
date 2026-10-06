import { useState, useEffect, useRef } from "react";
import {
  getUserRecipeCategories,
  getRecipes,
} from "@/modules/recipeLibrary/api/api";
import { SearchBar } from "@/modules/recipeLibrary/components/searchBar";
import { RecipeCategoryList } from "@/modules/recipeLibrary/components/recipeCategory";
import { RecipeList } from "@/modules/recipeLibrary/components/recipeList";
import type {
  Category,
  Recipe,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import { RecipeBuilderFormPage } from "@/modules/recipeBuilder/recipeBuilder.form.page";
import { getActiveScope } from "@/common/storage/activeScope";

// TODO :: [backend] Recipes belong to a company here, so a personal workspace (no
// company) shows a message instead. Personal recipes need routes that don't
// require one.

// The "All" entry the backend puts at the top of the category list
const ALL_CATEGORIES_ID = "all";
const PAGE_SIZE = 10;

/**
 * The company's recipe library: every recipe it has built, browsable by
 * category, searchable by name or description, and paged.
 *
 * A recipe is what goes into ONE unit of work (a 110mm brick wall, per m²).
 * From here users create new recipes, edit them, archive the ones they no
 * longer use (hidden, not lost: existing takeoffs keep working), restore
 * archived ones, and delete ones no takeoff uses.
 */
export function RecipeLibraryPage() {
  const { companyId } = getActiveScope();

  const [recipeList, setRecipeList] = useState<Recipe[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [showRecipeBuilder, setShowRecipeBuilder] = useState<boolean>(false);
  // true = showing archived recipes instead of the live ones
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORIES_ID);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Numbers each recipe request so a slow, older answer can't overwrite a newer
  // one (typing a search and clicking a category in quick succession)
  const latestRequest = useRef<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function loadCategories() {
    if (!companyId) return;
    try {
      const response = await getUserRecipeCategories({ companyId });
      setCategoryList(response.categories);
    } catch {
      // apiClient already reports the failure; the category list keeps what it had
    }
  }

  async function loadRecipes(
    categoryId: string,
    page: number,
    term: string,
    archived: boolean,
  ) {
    if (!companyId) return;
    const requestId = ++latestRequest.current;
    setIsLoading(true);

    try {
      const response = await getRecipes({
        companyId,
        categoryId,
        term: term || undefined,
        archived,
        page,
        limit: PAGE_SIZE,
      });
      if (requestId !== latestRequest.current) return;
      setRecipeList(response.recipes);
      setTotalCount(response.totalCount);
    } catch {
      // apiClient already reports the failure; the list keeps what it had
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadRecipes(ALL_CATEGORIES_ID, 1, "", false);
  }, [companyId]);

  function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    loadRecipes(categoryId, 1, searchTerm, showArchived);
  }

  function handleSearch(term: string) {
    setSearchTerm(term);
    setCurrentPage(1);
    loadRecipes(selectedCategoryId, 1, term, showArchived);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadRecipes(selectedCategoryId, page, searchTerm, showArchived);
  }

  function toggleArchivedView() {
    const next = !showArchived;
    setShowArchived(next);
    setCurrentPage(1);
    loadRecipes(selectedCategoryId, 1, searchTerm, next);
  }

  // A recipe was saved from the edit form: swap it into the list
  function handleRecipeUpdated(updated: Recipe) {
    setRecipeList((prev) =>
      prev.map((recipe) =>
        recipe.recipeId === updated.recipeId ? updated : recipe,
      ),
    );
    // its category may have changed, which moves the category counts
    loadCategories();
  }

  // A recipe was archived, restored or deleted: it leaves the list being viewed
  function handleRecipeRemoved(recipeId: string) {
    setRecipeList((prev) => prev.filter((recipe) => recipe.recipeId !== recipeId));
    setTotalCount((prev) => Math.max(prev - 1, 0));
    loadCategories();
  }

  // A new recipe was built: start from the first page so it can be found
  function handleRecipeCreated() {
    setCurrentPage(1);
    loadCategories();
    loadRecipes(selectedCategoryId, 1, searchTerm, showArchived);
  }

  if (!companyId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Select a company workspace to see its recipes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="flex w-full flex-col gap-4 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-bold text-3xl">
              {showArchived ? "Archived Recipes" : "Recipe Library"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {showArchived
                ? "Hidden from the library. Takeoffs that use them still work."
                : "Company specific construction recipes and standards"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleArchivedView}
              className="inline-flex items-center gap-2 rounded-md border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/70 cursor-pointer"
            >
              {showArchived ? "Show Active" : "Show Archived"}
            </button>
            <button
              onClick={() => setShowRecipeBuilder(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
            >
              + New Recipe
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 gap-6 p-4">
        <RecipeCategoryList
          categoryList={categoryList}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />
        <div className="flex flex-1 flex-col gap-4">
          <div className="w-full">
            <SearchBar onSearch={handleSearch} />
          </div>
          <RecipeList
            recipeList={recipeList}
            isLoading={isLoading}
            isArchivedView={showArchived}
            companyId={companyId}
            categories={categoryList}
            onRecipeUpdated={handleRecipeUpdated}
            onRecipeRemoved={handleRecipeRemoved}
          />

          {totalCount > 0 ? (
            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} — {totalCount} recipe
                {totalCount === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {showRecipeBuilder ? (
        <RecipeBuilderFormPage
          onClose={() => setShowRecipeBuilder(false)}
          onCreated={handleRecipeCreated}
        />
      ) : null}
    </div>
  );
}