import { useState, useEffect } from "react";
import { searchRecipe } from "@/modules/recipeLibrary/api/api";
import type { SetRecipeListState } from "@/modules/recipeLibrary/contracts/recipeLibrary.request.contracts";
import { FiSearch } from "react-icons/fi";

// TODO:: Need the companyId, CategoryID from somewhere
// TODO :: Implement Pagination

export function SearchBar({
  setRecipeListState,
}: {
  setRecipeListState: SetRecipeListState;
}) {
  const [userInput, setUserInput] = useState<string>("");

  useEffect(() => {
    if (userInput.length === 0) {
      return;
    }

    const debounceTimer = setTimeout(async () => {
      const response = await searchRecipe({
        companyId: "seed-company-001",
        categoryId: "seed-cat-001",
        term: userInput,
        limit: 20,
        page: 1,
      });
      setRecipeListState(response);
      setUserInput("");
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [userInput]);

  function saveUserInput(e: React.ChangeEvent<HTMLInputElement>) {
    setUserInput(e.target.value.toLowerCase().trim());
  }

  return (
    <div className="relative">
      <FiSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        onChange={saveUserInput}
        type="text"
        placeholder="Search recipes..."
        className="
          w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3
          text-sm text-zinc-900 placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-zinc-900
        "
      />
    </div>
  );
}