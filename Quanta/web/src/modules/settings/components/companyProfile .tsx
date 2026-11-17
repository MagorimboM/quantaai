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
    <div className="flex flex-col gap-5 rounded-2xl border border-[#F0EDE8] bg-white p-6">
      <div className="flex flex-row items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#FFF4EE] text-[#FF6B35]">
          <HiOutlineOfficeBuilding size={18} />
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-[#1C1917]">Company Information</h1>
      </div>

      {form ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map(({ key, label, type, wide }) => (
              <div key={key} className={wide ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-xs font-medium text-[#78716C]">
                  {label}
                </label>
                <input
                  type={type ?? "text"}
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full rounded-lg border border-[#F0EDE8] bg-[#FAFAF9] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-colors hover:border-[#FFD9C9] focus:border-[#FF6B35] focus:bg-white focus:ring-[3px] focus:ring-[#FFF4EE]"
                />
              </div>
            ))}
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="flex flex-row items-center justify-end gap-3 border-t border-[#F0EDE8] pt-4">
            {justSaved ? (
              <span className="text-xs text-[#A8A29E]">
                All changes saved
              </span>
            ) : null}
            <button
              onClick={cancelChanges}
              disabled={!hasChanges || isSaving}
              className="rounded-lg border border-[#F0EDE8] bg-white px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:border-[#FFD9C9] hover:bg-[#FFF4EE] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={!hasChanges || isSaving}
              className="rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#E85A26] focus:outline-none focus:ring-[3px] focus:ring-[#FFF4EE] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-[#78716C]">Loading company details…</p>
      )}
    </div>
  );
}