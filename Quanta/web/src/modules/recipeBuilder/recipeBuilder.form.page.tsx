import {
  getMaterialsAndCategories,
  getRecipeCategories,
  createNewRecipe,
} from "@/modules/recipeBuilder/api/api";

import { useEffect, useRef, useState } from "react";
import { RecipeLoadingModal } from "@/modules/recipeBuilder/components/RecipeLoadingModal";
import { RecipeSuccessModal } from "@/modules/recipeBuilder/components/RecipeSuccessModal";
import { MaterialSearchResultsModal } from "@/modules/recipeBuilder/components/MaterialSearchResultsModal";

type NewRecipe = {
  categoryId: string;
  recipeName: string;
  recipeCode: string;
  recipeDescription: string;
  recipeUnitMeasure: string;
  ingredients: {
    materialId: string;
    unitMeasureId: string;
    quantity: string;
  }[];
};

type MaterialCategories = {
  name: string;
  id: string;
}[];

type MaterialResult = {
  id: string;
  name: string;
  unit: string;
};

type SelectedMaterial = {
  materialId: string;
  name: string;
  unit: string;
  quantity: string;
};

type SiteCondition = {
  id: string;
  name: string;
};

// TODO :: replace with the real search-materials API call once wired up
async function searchMaterialsPlaceholder(
  term: string,
  categoryId: string,
): Promise<MaterialResult[]> {
  return [];
}

// TODO :: replace with the real get-site-conditions API call once wired up
async function getSiteConditionsPlaceholder(): Promise<SiteCondition[]> {
  return [];
}

export function RecipeBuilderFormPage({ onClose }: { onClose: () => void }) {
  // TODO:: Implement getting companyId from localStorage.
  const companyId = "seed-company-001";
  const categoryId = "seed-cat-001";

  const [materialsAndCategories, setMaterialsAndCategories] = useState<any>();
  const [recipeCategories, setRecipeCategories] = useState<any>();
  const [query, setQuery] = useState<string>("");
  const [newRecipe, setNewRecipe] = useState<NewRecipe>({
    categoryId: "",
    recipeName: "",
    recipeCode: "",
    recipeDescription: "",
    recipeUnitMeasure: "",
    ingredients: [],
  });

  const [searchMaterial, setSearchMaterial] = useState<{
    categoryId: string;
    term: string;
  }>({
    categoryId: "",
    term: "",
  });

  const [materialCategories, setMaterialCategories] =
    useState<MaterialCategories>([]);

  const [siteConditions, setSiteConditions] = useState<SiteCondition[]>([]);
  const [selectedSiteConditionId, setSelectedSiteConditionId] =
    useState<string>("");

  const [searchResults, setSearchResults] = useState<MaterialResult[]>([]);
  const [showSearchResultsModal, setShowSearchResultsModal] =
    useState<boolean>(false);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);

  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function GetMaterialsAndRecipeCategories() {
      const materials = await getMaterialsAndCategories(
        query,
        companyId,
        categoryId,
      );
      const recCategories = await getRecipeCategories(companyId);
      setRecipeCategories(recCategories);
      setMaterialsAndCategories(materials);
    }
    GetMaterialsAndRecipeCategories();
  }, []);

  // TODO :: fetch real site conditions once the backend endpoint exists 
  useEffect(() => {
    async function GetSiteConditions() {
      const conditions = await getSiteConditionsPlaceholder();
      setSiteConditions(conditions);
    }
    GetSiteConditions();
  }, []);

  function searchTerm(term: string) {
    const material = term.trim().toLowerCase();

    setSearchMaterial((prev) => ({ ...prev, term: material }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchMaterialsPlaceholder(
        material,
        searchMaterial.categoryId,
      );
      setSearchResults(results);
      setShowSearchResultsModal(true);
    }, 400);
  }

  function addMaterialToRecipe(material: MaterialResult) {
    const alreadyAdded = selectedMaterials.some(
      (item) => item.materialId === material.id,
    );

    if (alreadyAdded) return;

    setSelectedMaterials((prev) => [
      ...prev,
      {
        materialId: material.id,
        name: material.name,
        unit: material.unit,
        quantity: "",
      },
    ]);
  }

  function updateSelectedMaterialQuantity(materialId: string, value: string) {
    setSelectedMaterials((prev) =>
      prev.map((item) =>
        item.materialId === materialId
          ? { ...item, quantity: value.trim() }
          : item,
      ),
    );
  }

  function removeSelectedMaterial(materialId: string) {
    setSelectedMaterials((prev) =>
      prev.filter((item) => item.materialId !== materialId),
    );
  }

  function toggleSiteCondition(id: string) {
    setSelectedSiteConditionId((prev) => (prev === id ? "" : id));
  }

  async function handleSubmit() {
    const ingredients = selectedMaterials.map((item) => ({
      materialId: item.materialId,
      unitMeasureId: item.unit,
      quantity: item.quantity,
    }));

    setShowLoadingModal(true);

    await createNewRecipe({
      ...newRecipe,
      ingredients,
    });

    setShowLoadingModal(false);
    setShowSuccessModal(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-zinc-50 p-6 shadow-lg space-y-8"
      >
        {/* Recipe Details */}
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex flex-row justify-between p-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Recipe Details
          </h2>
          <button className="cursor-pointer p-2  rounded-lg border-2 " onClick={()=>onClose()}>
            x
          </button>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Recipe-name<span className="ml-0.5 text-black">*</span>
              </label>
              <input
                title="recipe-name"
                onChange={(e) =>
                  setNewRecipe((prev) => ({
                    ...prev,
                    recipeName: e.target.value.trim(),
                  }))
                }
                type="text"
                placeholder="e.g. 110mm Brick Wall"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-shadow placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Recipe-code
              </label>
              <input
                title="recipe-code"
                type="text"
                onChange={(e) =>
                  setNewRecipe((prev) => ({
                    ...prev,
                    recipeCode: e.target.value.trim(),
                  }))
                }
                placeholder="REC-001"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 transition-shadow placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Recipe-type
              </label>
              <div className="relative">
                <select
                  onChange={(e) =>
                    setNewRecipe((prev) => ({
                      ...prev,
                      categoryId: e.target.value.trim(),
                    }))
                  }
                  title="recipe-types"
                  className="w-full appearance-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option></option>
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Description
              </label>
              <input
                title="recipe-description"
                onChange={(e) => {
                  setNewRecipe((prev) => ({
                    ...prev,
                    recipeDescription: e.target.value.trim(),
                  }));
                }}
                type="text"
                placeholder="What this recipe covers…"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-shadow placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Unit of measure */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Quantities are per
            </label>
            <div className="flex items-center gap-2">
              <input
                title="recipe-unit-measure"
                onChange={(e) =>
                  setNewRecipe((prev) => ({
                    ...prev,
                    recipeUnitMeasure: e.target.value.trim(),
                  }))
                }
                type="text"
                placeholder="m²"
                className="w-28 rounded-md border border-zinc-200 bg-white px-3 py-2 text-center font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <span className="text-xs text-zinc-400">of output</span>
            </div>
          </div>
        </div>

        {/* Site Conditions */}
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Site Conditions
          </h2>
          <p className="text-xs text-zinc-400">
            Tag which site environment this recipe is valid for. Jobs will use
            this tag to surface the right recipe.
          </p>

          <div
            title="site-conditions-options"
            className="flex flex-wrap gap-2 rounded-md border border-dashed border-zinc-200 p-4"
          >
            {siteConditions.length > 0 ? (
              siteConditions.map((condition, key) => {
                const active = selectedSiteConditionId === condition.id;
                return (
                  <button
                    key={key}
                    onClick={() => toggleSiteCondition(condition.id)}
                    className={
                      active
                        ? "rounded-md border border-black bg-black px-3 py-1.5 text-xs text-white transition-colors"
                        : "rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:border-zinc-400"
                    }
                  >
                    {condition.name}
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-zinc-400">{"site conditions"}</span>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div
          title="add-materials"
          className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Ingredients
          </h2>

          <div title="material-category" className="flex flex-wrap gap-2">
            {materialCategories.map((category, key) => (
              <button
                key={key}
                onClick={() =>
                  setSearchMaterial((prev) => ({
                    ...prev,
                    categoryId: category.id,
                  }))
                }
                className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-400"
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <circle
                cx="5.5"
                cy="5.5"
                r="4"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M9 9l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <input
              title="search-material"
              onChange={(e) => searchTerm(e.target.value)}
              placeholder="Search ingredients by name or code…"
              className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div
            title="show-material-output"
            className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-200 p-4"
          >
            {selectedMaterials.length > 0 ? (
              selectedMaterials.map((item, key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2"
                >
                  <span className="truncate text-sm text-zinc-800">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      title="material-quantity"
                      type="number"
                      placeholder="0"
                      onChange={(e) =>
                        updateSelectedMaterialQuantity(
                          item.materialId,
                          e.target.value,
                        )
                      }
                      className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-right font-mono text-sm text-zinc-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <span className="w-10 text-[10px] font-mono text-zinc-400">
                      {item.unit}
                    </span>
                    <button
                      onClick={() => removeSelectedMaterial(item.materialId)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 2l8 8M10 2l-8 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-zinc-400">
                {"show material search results output"}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="rounded-md bg-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Add new Recipe
          </button>
        </div>
      </div>

      <MaterialSearchResultsModal
        show={showSearchResultsModal}
        results={searchResults}
        onClose={() => setShowSearchResultsModal(false)}
        onAdd={(material) => addMaterialToRecipe(material)}
      />

      <RecipeLoadingModal show={showLoadingModal} />

      <RecipeSuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
