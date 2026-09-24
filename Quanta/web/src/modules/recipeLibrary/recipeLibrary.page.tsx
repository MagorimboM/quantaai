import { useState, useEffect } from "react";
import {
  getUserRecipeCategories,
  getCategoryRecipe,
  searchRecipe,
} from "@/modules/recipeLibrary/api/api";
import { SearchBar } from "@/modules/recipeLibrary/components/searchBar";
import { RecipeCategoryList } from "@/modules/recipeLibrary/components/recipeCategory";
import { RecipeList } from "@/modules/recipeLibrary/components/recipeList";
import type {
  Category,
  Recipe,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import { RecipeBuilderFormPage } from "@/modules/recipeBuilder/recipeBuilder.form.page";

// TODO :: implement show Archived Recipes
// TODO :: implement edit recipe
// TODO :: implement delete recipe

const ALL_CATEGORIES_ID = "all";
const PAGE_SIZE = 10;

export function RecipeLibraryPage() {
  const [recipeList, setRecipeList] = useState<Recipe[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [showRecipeBuilder, setShowRecipeBuilder] = useState<boolean>(false);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORIES_ID);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function loadRecipes(categoryId: string, page: number, term: string) {
    setIsLoading(true);

    if (term.length > 0) {
      const response = await searchRecipe({
        companyId: "seed-company-001",
        categoryId: categoryId,
        term: term,
        limit: PAGE_SIZE,
        page: page,
      });
      setRecipeList(response.recipes);
      setTotalCount(response.totalCount);
      setIsLoading(false);
      return;
    }

    const response = await getCategoryRecipe({
      companyId: "seed-company-001",
      categoryId: categoryId,
      limit: PAGE_SIZE,
      page: page,
    });
    setRecipeList(response.recipes);
    setTotalCount(response.totalCount);
    setIsLoading(false);
  }

  useEffect(() => {
    async function getAllUserRecipesCategories() {
      const categoriesRequestResponse = await getUserRecipeCategories({
        companyId: "seed-company-001",
      });
      setCategoryList(categoriesRequestResponse.categories);
    }

    getAllUserRecipesCategories();
    loadRecipes(ALL_CATEGORIES_ID, 1, "");
  }, []);

  function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    loadRecipes(categoryId, 1, searchTerm);
  }

  function handleSearch(term: string) {
    setSearchTerm(term);
    setCurrentPage(1);
    loadRecipes(selectedCategoryId, 1, term);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadRecipes(selectedCategoryId, page, searchTerm);
  }

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="w-full flex flex-col gap-4 border- px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-bold text-3xl">Recipe Library</h1>
            <p className="text-sm text-zinc-500">
              Company specific construction recipes and standards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="
                inline-flex items-center gap-2 rounded-md border
                border-zinc-300 bg-white px-4 py-2 text-sm font-medium
                text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50
                hover:text-zinc-900 cursor-pointer
              "
            >
              Show Archived
            </button>
            <button
              onClick={() => setShowRecipeBuilder(true)}
              className="
                inline-flex items-center gap-2 rounded-md bg-zinc-900
                px-4 py-2 text-sm font-medium text-white transition-colors
                hover:bg-zinc-800 cursor-pointer
              "
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
            setRecipeListState={setRecipeList}
            isLoading={isLoading}
          />

          {totalCount > 0 ? (
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
              <p className="text-xs text-zinc-400">
                Page {currentPage} of {totalPages} — {totalCount} recipe
                {totalCount === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {showRecipeBuilder ? (
        <RecipeBuilderFormPage onClose={() => setShowRecipeBuilder(false)} />
      ) : null}
    </div>
  );
}
