import { useState } from "react";
import { Plus } from "lucide-react";
import { NewSiteClassForm } from "@/modules/recipeBuilder/components/newSiteClassForm";
import type {
  BuildingClassOption,
  SiteClassOption,
} from "@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts";

const groupLabelClass = "mb-1 block text-xs font-medium text-muted-foreground";

// The same chips the rest of the builder uses
function chipClass(active: boolean) {
  return active
    ? "rounded-md border border-primary bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors cursor-pointer"
    : "rounded-md border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-ring cursor-pointer";
}

// Adds the id if it is missing, removes it if it is there
function toggle(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((each) => each !== id) : [...ids, id];
}

/**
 * The building classes and site classes a new recipe suits. Several of each
 * can be chosen: click a chip to choose it, click again to clear it.
 *
 * At least one building class is needed. The library is always narrowed to a
 * building class, so a recipe with none would never show there. Site classes
 * are optional: with none, the recipe only shows under "All sites".
 *
 * The builder loads the options and keeps the chosen ids. "Add site class"
 * opens a small form, and the new class is passed up through
 * `onSiteClassCreated` so the builder can add it to its list and choose it.
 */
export function RecipeClassPicker({
  companyId,
  buildingClasses,
  siteClasses,
  buildingClassIds,
  siteClassIds,
  onChangeBuildingClassIds,
  onChangeSiteClassIds,
  onSiteClassCreated,
}: {
  companyId: string;
  buildingClasses: BuildingClassOption[];
  siteClasses: SiteClassOption[];
  buildingClassIds: string[];
  siteClassIds: string[];
  onChangeBuildingClassIds: (ids: string[]) => void;
  onChangeSiteClassIds: (ids: string[]) => void;
  onSiteClassCreated: (siteClass: SiteClassOption) => void;
}) {
  const [showNewSiteClass, setShowNewSiteClass] = useState(false);

  function handleSiteClassCreated(created: SiteClassOption) {
    onSiteClassCreated(created);
    setShowNewSiteClass(false);
  }

  return (
    <div className="space-y-4">
      {/* Building classes: at least one */}
      <div>
        <label className={groupLabelClass}>
          Building classes<span className="ml-0.5 text-destructive">*</span>
        </label>
        <div
          title="building-class-options"
          className="flex flex-wrap gap-2 rounded-md border border-dashed p-4"
        >
          {buildingClasses.length > 0 ? (
            buildingClasses.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.description || undefined}
                aria-pressed={buildingClassIds.includes(item.id)}
                onClick={() =>
                  onChangeBuildingClassIds(toggle(buildingClassIds, item.id))
                }
                className={chipClass(buildingClassIds.includes(item.id))}
              >
                {item.name}
              </button>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              No building classes available.
            </span>
          )}
        </div>
      </div>

      {/* Site classes: optional, and new ones can be added */}
      <div>
        <label className={groupLabelClass}>Site classes</label>
        <div
          title="site-class-options"
          className="flex flex-wrap gap-2 rounded-md border border-dashed p-4"
        >
          {siteClasses.map((item) => {
            const active = siteClassIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                title={item.description || undefined}
                aria-pressed={active}
                onClick={() => onChangeSiteClassIds(toggle(siteClassIds, item.id))}
                className={chipClass(active)}
              >
                {item.name}
                {item.description ? (
                  <span
                    className={
                      active ? "text-primary-foreground/70" : "text-muted-foreground"
                    }
                  >
                    {" "}
                    · {item.description}
                  </span>
                ) : null}
              </button>
            );
          })}

          {!showNewSiteClass ? (
            <button
              type="button"
              title="add-site-class"
              onClick={() => setShowNewSiteClass(true)}
              className="inline-flex items-center gap-1 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-ring hover:text-foreground cursor-pointer"
            >
              <Plus size={12} /> Add site class
            </button>
          ) : null}
        </div>

        {showNewSiteClass ? (
          <div className="mt-3">
            <NewSiteClassForm
              companyId={companyId}
              onCreated={handleSiteClassCreated}
              onCancel={() => setShowNewSiteClass(false)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}