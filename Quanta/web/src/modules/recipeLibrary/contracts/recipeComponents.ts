import type { CatalogueKind } from "@/modules/recipeLibrary/contracts/createRecipe.types";

// The three sections a recipe is made of. The names match the catalogue
// response (materials, labour, overheads).
export type ComponentSection = "materials" | "labour" | "overheads";

export const COMPONENT_SECTIONS: ComponentSection[] = [
  "materials",
  "labour",
  "overheads",
];

export const SECTION_LABEL: Record<ComponentSection, string> = {
  materials: "Materials",
  labour: "Labour",
  overheads: "Overheads",
};

// The word for ONE item of a section, used in "Create new material"
export const SECTION_KIND: Record<ComponentSection, CatalogueKind> = {
  materials: "material",
  labour: "labour",
  overheads: "overhead",
};

// What is being made in the "create" dialog. A category is not a recipe
// component, so it has no section.
export type CreateKind = CatalogueKind | "category";

// One component the user has added: the quantity stays text while typing so
// "0." and an empty box are allowed, and is checked when saving.
export type AddedComponent = {
  itemId: string;
  quantity: string;
};

export type AddedComponents = Record<ComponentSection, AddedComponent[]>;