import { useState } from "react";
import type { KeyboardEvent } from "react";
import { createSiteClass } from "@/modules/recipeBuilder/api/api";
import type { SiteClassOption } from "@/modules/recipeBuilder/contracts/recipeBuilder.response.contracts";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

// The same limit the backend checks: the name sits on a small chip
const MAX_NAME_LENGTH = 40;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

/**
 * A small inline form for adding a site class the user doesn't have yet, for
 * example a local soil type. The description is shown after the name in the
 * library's site class strip, so it is kept short.
 *
 * On success it hands the new site class to `onCreated`, so the picker can add
 * it to its list and select it.
 *
 * It is a group of fields rather than a <form>, so it can sit inside another
 * form without submitting it. Enter in either field saves.
 */
export function NewSiteClassForm({
  companyId,
  onCreated,
  onCancel,
}: {
  companyId: string;
  onCreated: (siteClass: SiteClassOption) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim() !== "" && description.trim() !== "" && !isSaving;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSave();
  }

  async function handleSave() {
    if (!canSave) return;

    setIsSaving(true);
    setError(null);
    try {
      const created = await createSiteClass({
        companyId,
        name: name.trim(),
        description: description.trim(),
      });
      onCreated(created);
    } catch (caught) {
      setError(
        apiErrorMessage(caught, "Couldn't add the site class. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      role="group"
      aria-label="New site class"
      className="space-y-3 rounded-md border bg-background p-4"
    >
      <p className="text-xs font-semibold text-foreground">New site class</p>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>
            Name<span className="ml-0.5 text-destructive">*</span>
          </label>
          <input
            title="site-class-name"
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Class M-D"
            className={inputClass}
            autoFocus
          />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>
            Short description<span className="ml-0.5 text-destructive">*</span>
          </label>
          <input
            title="site-class-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Moderately reactive, deep movement"
            className={inputClass}
          />
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? "Adding…" : "Add site class"}
        </button>
      </div>
    </div>
  );
}