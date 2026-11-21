import { useState, useEffect, useRef, useMemo } from "react";
import { MdOutlineArrowRightAlt } from "react-icons/md";
import {
  getUserRecipeCategories,
  getRecipes,
  getRecipeClassifications,
  getRecipeCatalogue,
  createCatalogueItem,
  createCategory,
  createRecipe,
  createBuildingClass,
  createSiteClass,
} from "@/modules/recipeLibrary/api/api";
import { SearchBar } from "@/modules/recipeLibrary/components/searchBar";
import { RecipeCategoryList } from "@/modules/recipeLibrary/components/recipeCategory";
import { RecipeList } from "@/modules/recipeLibrary/components/recipeList";
import {
  EmptyRecipeDetail,
  RecipeDetailPanel,
} from "@/modules/recipeLibrary/components/recipeDetailPanel";
import type {
  BuildingClassItem,
  Category,
  Recipe,
  SiteClassItem,
} from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";
import { CreateRecipeModal } from "@/modules/recipeLibrary/components/createRecipeModal";
import type { CreateRecipeApi } from "@/modules/recipeLibrary/contracts/createRecipe.types";
import { BuildingClassSelector } from "@/modules/recipeLibrary/components/buildingClassSelector";
import { SiteClassBar } from "@/modules/recipeLibrary/components/siteClassBar";
import { getActiveScope } from "@/common/storage/activeScope";

// TODO :: [backend] Recipes belong to a company here, so a personal workspace (no
// company) shows a message instead. Personal recipes need routes that don't
// require one.

// The "All" entry the backend puts at the top of the category list, and the id
// the backend reads as "every site class / building class"
const ALL_CATEGORIES_ID = "all";
const ALL_CLASSES_ID = "all";
const PAGE_SIZE = 10;

// The building class the library opens on, matched by name. If the user has
// none by that name, the first building class is used.
const DEFAULT_BUILDING_CLASS_NAME = "residential";

// Everything that decides which recipes the middle column shows
type RecipeQuery = {
  categoryId: string;
  page: number;
  term: string;
  archived: boolean;
  buildingClassId: string;
  siteClassId: string;
};

/**
 * The company's recipe library: a building class and a site class to narrow
 * by, then three columns: categories, the recipes in the chosen category
 * (searchable and paged), and the selected recipe in full with its edit,
 * archive and delete actions.
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
  const [buildingClassList, setBuildingClassList] = useState<
    BuildingClassItem[]
  >([]);
  const [siteClassList, setSiteClassList] = useState<SiteClassItem[]>([]);
  const [showRecipeBuilder, setShowRecipeBuilder] = useState<boolean>(false);
  // true = showing archived recipes instead of the live ones
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const [buildingClassId, setBuildingClassId] =
    useState<string>(ALL_CLASSES_ID);
  const [siteClassId, setSiteClassId] = useState<string>(ALL_CLASSES_ID);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORIES_ID);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  // How many archived recipes the current filters would find
  const [archivedCount, setArchivedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Numbers each recipe request so a slow, older answer can't overwrite a newer
  // one (typing a search and clicking a category in quick succession)
  const latestRequest = useRef<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // The query as the page currently stands. Handlers pass only what changed.
  const currentQuery: RecipeQuery = {
    categoryId: selectedCategoryId,
    page: currentPage,
    term: searchTerm,
    archived: showArchived,
    buildingClassId,
    siteClassId,
  };

  // Until one is clicked (or if the selected one is no longer on this page),
  // the first recipe on the page is the selected one
  const selectedRecipe =
    recipeList.find((recipe) => recipe.recipeId === selectedRecipeId) ??
    recipeList[0] ??
    null;

  const selectedCategoryName =
    categoryList.find((category) => category.categoryId === selectedCategoryId)
      ?.categoryName ?? "All Categories";

  const buildingClassName =
    buildingClassList.find((item) => item.buildingClassId === buildingClassId)
      ?.buildingClassName ?? "All buildings";
  const siteClassName =
    siteClassList.find((item) => item.siteClassId === siteClassId)
      ?.siteClassName ?? "All sites";

  // Live recipes per building class, for the counts on the selector
  const buildingClassCounts = useMemo(
    () =>
      Object.fromEntries(
        buildingClassList.map((item) => [
          item.buildingClassId,
          Number(item.numberOfRecipes),
        ]),
      ),
    [buildingClassList],
  );

  // The calls the shared "Create recipe" form makes, bound to this company.
  // The form asks where the recipe applies, so it also gets the classes and a
  // way to add a site class. It opens with the classes being viewed already
  // chosen (see initialBuildingClassIds below).
  // null in a personal workspace, where there is no company to build for.
  const createRecipeApi = useMemo<CreateRecipeApi<Recipe> | null>(() => {
    if (!companyId) return null;
    return {
      loadCatalogue: () => getRecipeCatalogue({ companyId }),
      createCatalogueItem: (item) => createCatalogueItem({ companyId, ...item }),
      createCategory: (name) => createCategory({ companyId, name }),
      createRecipe: (recipe) => createRecipe({ companyId, ...recipe }),
      loadClasses: async () => {
        const response = await getRecipeClassifications({ companyId });
        return {
          buildingClasses: response.buildingClass.map((item) => ({
            id: item.buildingClassId,
            name: item.buildingClassName,
            description: item.buildingClassDescription,
          })),
          siteClasses: response.siteClass.map((item) => ({
            id: item.siteClassId,
            name: item.siteClassName,
            description: item.siteClassDescription,
          })),
        };
      },
      createBuildingClass: async (buildingClass) => {
        const created = await createBuildingClass({ companyId, ...buildingClass });
        // so the building class tiles at the top show it too
        setBuildingClassList((prev) => [...prev, created]);
        return {
          id: created.buildingClassId,
          name: created.buildingClassName,
          description: created.buildingClassDescription,
        };
      },
      createSiteClass: async (siteClass) => {
        const created = await createSiteClass({ companyId, ...siteClass });
        // so the site class strip at the top shows it too
        setSiteClassList((prev) => [...prev, created]);
        return {
          id: created.siteClassId,
          name: created.siteClassName,
          description: created.siteClassDescription,
        };
      },
    };
  }, [companyId]);

  // The selectors' options. Returns the building class to open on.
  async function loadClassifications(): Promise<string> {
    if (!companyId) return ALL_CLASSES_ID;
    try {
      const response = await getRecipeClassifications({ companyId });
      setBuildingClassList(response.buildingClass);
      setSiteClassList(response.siteClass);

      const preferred =
        response.buildingClass.find(
          (item) =>
            item.buildingClassName.toLowerCase() === DEFAULT_BUILDING_CLASS_NAME,
        ) ?? response.buildingClass[0];
      return preferred?.buildingClassId ?? ALL_CLASSES_ID;
    } catch {
      // apiClient already reports the failure; the library opens unfiltered
      return ALL_CLASSES_ID;
    }
  }

  // Category counts follow the building class and site class being viewed
  async function loadCategories(
    classes: Pick<RecipeQuery, "buildingClassId" | "siteClassId"> = currentQuery,
  ) {
    if (!companyId) return;
    try {
      const response = await getUserRecipeCategories({
        companyId,
        buildingClassId: classes.buildingClassId,
        siteClassId: classes.siteClassId,
      });
      setCategoryList(response.categories);
    } catch {
      // apiClient already reports the failure; the category list keeps what it had
    }
  }

  async function loadRecipes(changes: Partial<RecipeQuery> = {}) {
    if (!companyId) return;
    const query = { ...currentQuery, ...changes };
    const requestId = ++latestRequest.current;
    setIsLoading(true);

    try {
      const response = await getRecipes({
        companyId,
        categoryId: query.categoryId,
        buildingClassId: query.buildingClassId,
        siteClassId: query.siteClassId,
        term: query.term || undefined,
        archived: query.archived,
        page: query.page,
        limit: PAGE_SIZE,
      });
      if (requestId !== latestRequest.current) return;
      setRecipeList(response.recipes);
      setTotalCount(response.totalCount);
      setArchivedCount(response.archivedCount);
    } catch {
      // apiClient already reports the failure; the list keeps what it had
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }

  // Opens on the default building class, all sites, all categories
  useEffect(() => {
    let cancelled = false;

    async function openLibrary() {
      const openingClassId = await loadClassifications();
      if (cancelled) return;

      const opening = {
        categoryId: ALL_CATEGORIES_ID,
        page: 1,
        term: "",
        archived: false,
        buildingClassId: openingClassId,
        siteClassId: ALL_CLASSES_ID,
      };
      setBuildingClassId(opening.buildingClassId);
      setSiteClassId(opening.siteClassId);
      setSelectedCategoryId(opening.categoryId);
      setSearchTerm(opening.term);
      setShowArchived(opening.archived);
      setCurrentPage(opening.page);

      loadCategories(opening);
      loadRecipes(opening);
    }

    openLibrary();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  function handleSelectBuildingClass(id: string) {
    setBuildingClassId(id);
    setCurrentPage(1);
    loadCategories({ buildingClassId: id, siteClassId });
    loadRecipes({ buildingClassId: id, page: 1 });
  }

  function handleSelectSiteClass(id: string) {
    setSiteClassId(id);
    setCurrentPage(1);
    loadCategories({ buildingClassId, siteClassId: id });
    loadRecipes({ siteClassId: id, page: 1 });
  }

  function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    loadRecipes({ categoryId, page: 1 });
  }

  function handleSearch(term: string) {
    setSearchTerm(term);
    setCurrentPage(1);
    loadRecipes({ term, page: 1 });
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadRecipes({ page });
  }

  function toggleArchivedView() {
    const next = !showArchived;
    setShowArchived(next);
    setCurrentPage(1);
    loadRecipes({ archived: next, page: 1 });
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

  // A recipe was archived, restored or deleted: it leaves the list being viewed.
  // Reloading the page fills the gap it leaves and corrects the archived count
  // and the class counts.
  function handleRecipeRemoved(recipeId: string) {
    setRecipeList((prev) => prev.filter((recipe) => recipe.recipeId !== recipeId));
    setTotalCount((prev) => Math.max(prev - 1, 0));
    loadCategories();
    loadClassifications();
    loadRecipes();
  }

  // A new recipe was built: start from the first page so it can be found
  function handleRecipeCreated() {
    setCurrentPage(1);
    loadCategories();
    loadClassifications();
    loadRecipes({ page: 1 });
  }

  if (!companyId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#FAF8F5] p-4">
        <p className="text-sm text-[#78716C]">
          Select a company workspace to see its recipes.
        </p>
      </div>
    );
  }

  const pageButton =
    "cursor-pointer rounded-lg border border-[#EFECE6] bg-white px-3 py-1.5 text-[11px] font-bold text-[#57534E] transition-colors hover:border-[#FFB6A5] hover:text-[#E95333] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-[#FAF8F5] px-8 pb-6 pt-6 text-[#1C1917]">
      {/* Header: brand, search, actions */}
      <header className="grid shrink-0 grid-cols-[1fr_1.18fr_1fr] items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="logo-mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <h1 className="mt-0.5 text-[18px] font-bold tracking-[-0.025em]">
              {showArchived ? "Archived Recipes" : "Recipe Library"}
            </h1>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={toggleArchivedView}
            className="h-11 cursor-pointer rounded-xl border border-[#E7E3DC] bg-white px-4 text-[11px] font-bold text-[#57534E] transition-colors hover:border-[#FFB6A5] hover:text-[#E95333]"
          >
            {showArchived ? "Show Active" : `Show Archived (${archivedCount})`}
          </button>
          <button
            type="button"
            onClick={() => setShowRecipeBuilder(true)}
            className="primary-button h-11"
          >
            <span className="text-lg font-medium leading-none">+</span> Create
            Recipe
          </button>
        </div>
      </header>

      {/* Step 1 and 2: building class, then site class */}
      <BuildingClassSelector
        options={buildingClassList}
        counts={buildingClassCounts}
        selectedId={buildingClassId}
        onSelect={handleSelectBuildingClass}
      />
      <SiteClassBar
        options={siteClassList}
        allId={ALL_CLASSES_ID}
        selectedId={siteClassId}
        onSelect={handleSelectSiteClass}
      />

      {/* Three columns (22% / 43% / 35%): categories, results, selected recipe.
          The page scrolls if the screen is too short for all three rows. */}
      <section className="mt-4 grid min-h-[480px] flex-1 grid-cols-[minmax(0,22fr)_minmax(0,43fr)_minmax(0,35fr)] gap-4">
        <RecipeCategoryList
          categoryList={categoryList}
          selectedCategoryId={selectedCategoryId}
          isArchivedView={showArchived}
          buildingClassName={buildingClassName}
          siteClassName={siteClassName}
          onSelectCategory={handleSelectCategory}
        />

        <section className="panel flex min-h-0 min-w-0 flex-col overflow-hidden p-5">
          <div className="flex shrink-0 items-end justify-between">
            <div>
              <p className="eyebrow">Recipe results</p>
              <h2 className="mt-1 text-[16px] font-bold tracking-[-0.02em]">
                {selectedCategoryName}
              </h2>
            </div>
            <span className="text-[11px] font-medium text-[#A8A29E]">
              {totalCount} recipe{totalCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            <RecipeList
              recipeList={recipeList}
              isLoading={isLoading}
              isArchivedView={showArchived}
              selectedRecipeId={selectedRecipe?.recipeId ?? null}
              onSelectRecipe={setSelectedRecipeId}
            />
          </div>

          {totalCount > 0 ? (
            <div className="mt-3 flex shrink-0 items-center justify-between border-t border-[#EDE8E1] pt-3">
              <p className="text-[11px] text-[#A8A29E]">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={pageButton}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`${pageButton} inline-flex items-center gap-1`}
                >
                  Next <MdOutlineArrowRightAlt size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {selectedRecipe ? (
          <RecipeDetailPanel
            key={selectedRecipe.recipeId}
            recipe={selectedRecipe}
            companyId={companyId}
            categories={categoryList}
            isArchivedView={showArchived}
            onUpdated={handleRecipeUpdated}
            onRemoved={handleRecipeRemoved}
          />
        ) : (
          <EmptyRecipeDetail />
        )}
      </section>

      {showRecipeBuilder && createRecipeApi ? (
        <CreateRecipeModal
          api={createRecipeApi}
          onCreated={handleRecipeCreated}
          onClose={() => setShowRecipeBuilder(false)}
          initialBuildingClassIds={
            buildingClassId === ALL_CLASSES_ID ? [] : [buildingClassId]
          }
          initialSiteClassIds={siteClassId === ALL_CLASSES_ID ? [] : [siteClassId]}
        />
      ) : null}
    </div>
  );
}