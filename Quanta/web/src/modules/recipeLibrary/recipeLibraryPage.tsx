import { useState, useEffect } from "react";
import { getUserRecipeCategories } from "@/modules/recipeLibrary/api/api";
import { SearchBar } from "@/modules/recipeLibrary/components/searchBar";
import { RecipeCategoryList } from "@/modules/recipeLibrary/components/recipeCategory";
import { RecipeList } from "@/modules/recipeLibrary/components/recipeList";
import type { Category, Recipe } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// TODO :: finish off useEffect for on mount it shoots categories requests and recipe lists.
// TODO :: New Recipe Form -> create form and connect it to the backend
// TODO :: show archived -> create modal, show list of archived recipe of that company and user id -> connect to the backend

export function RecipeLibraryPage() {
  const [recipeList, setRecipeList] = useState<Recipe[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  useEffect(() => {
    async function getAllUserRecipesCategories() {
      const categoriesRequestResponse = await getUserRecipeCategories({
        companyId: "seed-company-001",
      });
      setCategoryList(categoriesRequestResponse.categories);
    }

    getAllUserRecipesCategories();

    // TODO: no "most used recipes" endpoint exists in api.ts yet — once one
    // does, fetch it here and call setRecipeList with the response so the
    // page isn't empty before the user searches or picks a category.
  }, []);

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
          recipeListUpdater={setRecipeList}
          categoryList={categoryList}
        />
        <div className="flex flex-1 flex-col gap-4">
          <div className="w-full">
            <SearchBar setRecipeListState={setRecipeList} />
          </div>
          <RecipeList
            recipeList={recipeList}
            setRecipeListState={setRecipeList}
          />
        </div>
      </main>
    </div>
  );
}