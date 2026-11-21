import { useMemo } from "react";
import { CreateRecipeModal as SharedCreateRecipeModal } from "@/modules/recipeLibrary/components/createRecipeModal";
import type { CreateRecipeApi } from "@/modules/recipeLibrary/contracts/createRecipe.types";
import {
  createCatalogueItem,
  createCategory,
  createRecipe,
  getRecipeCatalogue,
} from "@/modules/quantityTakeoff/api/api";
import {
  createBuildingClass,
  createSiteClass,
  getRecipeClassifications,
} from "@/modules/recipeLibrary/api/api";
import type { RecipeOption } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";

/**
 * The takeoff's "Create recipe" form. It is the same form as the recipe
 * library's (one form, so the two can't drift apart). This file only binds that
 * form to the takeoff's own routes for this project.
 *
 * The catalogue, new catalogue items, new categories and the recipe itself go
 * through the takeoff's routes. Building classes and site classes belong to the
 * user, not the project, so they come from the recipe library's routes.
 *
 * `onCreated` receives the saved recipe shaped like the "Add line item" list,
 * so the picker can show it and select it straight away.
 */
export function CreateRecipeModal({
  companyId,
  projectId,
  onCreated,
  onClose,
}: {
  companyId: string;
  projectId: string;
  onCreated: (recipe: RecipeOption) => void;
  onClose: () => void;
}) {
  // Stable between renders: the form loads the catalogue when `api` changes
  const api = useMemo<CreateRecipeApi<RecipeOption>>(
    () => ({
      loadCatalogue: () => getRecipeCatalogue({ companyId, projectId }),
      createCatalogueItem: (item) =>
        createCatalogueItem({ companyId, projectId, ...item }),
      createCategory: (name) => createCategory({ companyId, projectId, name }),
      createRecipe: (recipe) => createRecipe({ companyId, projectId, ...recipe }),

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
        return {
          id: created.buildingClassId,
          name: created.buildingClassName,
          description: created.buildingClassDescription,
        };
      },
      createSiteClass: async (siteClass) => {
        const created = await createSiteClass({ companyId, ...siteClass });
        return {
          id: created.siteClassId,
          name: created.siteClassName,
          description: created.siteClassDescription,
        };
      },
    }),
    [companyId, projectId],
  );

  return (
    <SharedCreateRecipeModal api={api} onCreated={onCreated} onClose={onClose} />
  );
}