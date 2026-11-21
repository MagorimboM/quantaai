import type { Recipe } from "@/modules/recipeLibrary/contracts/recipeLibrary.response.contracts";

// Building class and site class: the two ways the Recipe Library is meant to be
// narrowed before categories. THE BACKEND DOESN'T HAVE THESE YET, so everything
// here is a front-end shell: the lists below are fixed, the selection lives in
// the page's state, and nothing is sent to the server.
//
// TODO :: [backend] Add `buildingClass` and `siteClass` (the ids below) to the
// Recipe table, the recipe responses and the create/update recipe requests.
// TODO :: [backend] getRecipes / getUserRecipeCategories should accept
// `buildingClass` and `siteClass` filters, and return recipe counts per
// building class so BuildingClassSelector can show "48 recipes".

export type BuildingClass = {
  id: string;
  name: string;
  // Shown in the tile's icon box
  glyph: string;
};

export type SiteClass = {
  id: string;
  name: string;
  // e.g. "Standard / Sand", shown after the name in the pill
  detail?: string;
  // Used in the detail panel's badge, e.g. "Class P (Muddy)"
  badge: string;
};

export const BUILDING_CLASSES: BuildingClass[] = [
  { id: "residential", name: "Residential", glyph: "⌂" },
  { id: "commercial", name: "Commercial", glyph: "▦" },
  { id: "industrial", name: "Industrial", glyph: "◇" },
  { id: "civil", name: "Civil", glyph: "⌁" },
];

export const ALL_SITES_ID = "all";

export const SITE_CLASSES: SiteClass[] = [
  { id: ALL_SITES_ID, name: "All Sites", badge: "All sites" },
  { id: "class-a", name: "Class A", detail: "Standard / Sand", badge: "Class A" },
  { id: "class-m", name: "Class M", detail: "Moderate", badge: "Class M" },
  { id: "class-h", name: "Class H1/H2", detail: "Clay", badge: "Class H1/H2 (Clay)" },
  {
    id: "class-p",
    name: "Class P",
    detail: "Muddy / Problem Site",
    badge: "Class P (Muddy)",
  },
];

export const DEFAULT_BUILDING_CLASS_ID = BUILDING_CLASSES[0].id;

export function findBuildingClass(id: string): BuildingClass {
  return BUILDING_CLASSES.find((item) => item.id === id) ?? BUILDING_CLASSES[0];
}

export function findSiteClass(id: string): SiteClass {
  return SITE_CLASSES.find((item) => item.id === id) ?? SITE_CLASSES[0];
}

// A recipe's own classification, for the badges in the detail panel. Recipes
// don't carry these fields yet, so both come back undefined. Once the backend
// adds them to Recipe, replace the cast with `recipe.buildingClass` and
// `recipe.siteClass`.
export function getRecipeClassification(recipe: Recipe): {
  building: BuildingClass | undefined;
  site: SiteClass | undefined;
} {
  const fields = recipe as Recipe & { buildingClass?: string; siteClass?: string };
  return {
    building: BUILDING_CLASSES.find((item) => item.id === fields.buildingClass),
    site: SITE_CLASSES.find((item) => item.id === fields.siteClass),
  };
}