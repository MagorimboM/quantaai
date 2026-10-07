import { useEffect, useState } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import {
  getCompanyProfile,
  updateCompanyProfile,
} from "@/modules/settings/api/api";
import type { CompanyProfileFields } from "@/modules/settings/contracts/settings.request.contracts";
import type { CompanyProfileDetails } from "@/modules/settings/contracts/settings.response.contracts";
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

// The editable company details, in the order they are shown. `wide` fields take
// the full row.
const FIELDS: {
  key: keyof CompanyProfileFields;
  label: string;
  type?: "text" | "email" | "tel";
  wide?: boolean;
}[] = [
  { key: "name", label: "Company Name", wide: true },
  { key: "companyType", label: "Company Type" },
  { key: "country", label: "Country" },
  { key: "address", label: "Street Address", wide: true },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "postcode", label: "Postcode" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "email", label: "Email", type: "email" },
  { key: "contactName", label: "Contact Name" },
  { key: "contactPhone", label: "Contact Phone", type: "tel" },
  { key: "contactEmail", label: "Contact Email", type: "email" },
];

// The stored company without its id, as the editable fields
function toFields(details: CompanyProfileDetails): CompanyProfileFields {
  const fields = {} as CompanyProfileFields;
  for (const { key } of FIELDS) fields[key] = details[key];
  return fields;
}

/**
 * The company's details: name, type, address and contacts. They are edited in a
 * form and saved with the Save button; Cancel puts back what was last saved.
 * The same details are collected when a company workspace is first created.
 */
export function CompanyProfile({ companyId }: { companyId: string }) {
  // What is stored, and what is in the form right now
  const [saved, setSaved] = useState<CompanyProfileFields | null>(null);
  const [form, setForm] = useState<CompanyProfileFields | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const fields = toFields(await getCompanyProfile({ companyId }));
        setSaved(fields);
        setForm(fields);
      } catch {
        // apiClient already reports the failure; the form stays unavailable
      }
    }

    loadProfile();
  }, [companyId]);

  const hasChanges =
    saved !== null &&
    form !== null &&
    FIELDS.some(({ key }) => form[key] !== saved[key]);

  function updateField(key: keyof CompanyProfileFields, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setJustSaved(false);
  }

  function cancelChanges() {
    setForm(saved);
    setErrorMessage(null);
    setJustSaved(false);
  }

  async function saveChanges() {
    if (!form) return;
    if (!form.name.trim()) {
      setErrorMessage("The company needs a name.");
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      const fields = toFields(await updateCompanyProfile({ companyId, ...form }));
      setSaved(fields);
      setForm(fields);
      setJustSaved(true);
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Couldn't save your changes. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground">
      <div className="flex flex-row items-center gap-3">
        <HiOutlineOfficeBuilding size={24} />
        <h1 className="text-2xl font-bold">Company Information</h1>
      </div>

      {form ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map(({ key, label, type, wide }) => (
              <div key={key} className={wide ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {label}
                </label>
                <input
                  type={type ?? "text"}
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <div className="flex flex-row items-center justify-end gap-3">
            {justSaved ? (
              <span className="text-xs text-muted-foreground">
                All changes saved
              </span>
            ) : null}
            <button
              onClick={cancelChanges}
              disabled={!hasChanges || isSaving}
              className="rounded-lg border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={!hasChanges || isSaving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Loading company details…</p>
      )}
    </div>
  );
}