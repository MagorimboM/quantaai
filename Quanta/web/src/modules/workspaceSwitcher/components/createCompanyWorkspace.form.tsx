import { useState } from "react";
import { MdClose } from "react-icons/md";
import { postNewWorkspace } from "@/modules/workspaceSwitcher/api/api";
import { CreatingWorkspaceModal } from "@/modules/workspaceSwitcher/components/creatingWorkspace.modal";

// Shared look for every field in this form
const labelClass = "mb-1.5 block text-xs font-medium text-[#57534E]";
const inputClass =
  "h-10 w-full rounded-lg border border-[#DEDAD4] bg-white px-3 text-sm text-[#1C1917] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#A8A29E] focus:border-[#FF6B35] focus:ring-[3px] focus:ring-[#FFF4EE]";

// TODO :: create modal component showing the creating workspace
// TODO  :: create modal component showing success in creating workspace

export function CreateCompanyWorkspaceForm({
  onClose,
  addToList,
}: {
  onClose: () => void;
  addToList: (newCompany: any) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "Australia",
    phone: "",
    email: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    companyType: "",
  });

  const [showCreatingWorkspaceModal, setShowCreatingWorkspaceModal] =
    useState<boolean>(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitForm() {
    setShowCreatingWorkspaceModal(true);

    const response = await postNewWorkspace(form);
    if (!response) {
      console.log("something is up");
      setShowCreatingWorkspaceModal(false);
      return;
    }
    addToList(response);
    setShowCreatingWorkspaceModal(false);
    onClose();
  }

  return (
    <>
      <div
        title="background"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/20 p-6"
        onClick={onClose}
      >
        <div
          title="create-workspace-form"
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-2xl border border-[#F0EDE8] bg-white p-6 text-[#1C1917]"
        >
          <div className="flex items-center justify-between border-b border-[#F0EDE8] pb-4">
            <h1 className="text-xl font-semibold tracking-[-0.025em] text-[#1C1917]">
              Create Company Workspace
            </h1>
            <button
              onClick={onClose}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#78716C] transition-colors hover:bg-[#FAFAF9] hover:text-[#1C1917]"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>
                Company Name
              </label>
              <input
                title="company-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Address
              </label>
              <input
                title="company-address"
                type="text"
                required
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>
                  City
                </label>
                <input
                  title="company-city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  State
                </label>
                <input
                  title="company-state"
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Postcode
                </label>
                <input
                  title="company-postcode"
                  type="text"
                  required
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Country
                </label>
                <input
                  title="company-country"
                  type="text"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Company Type
                </label>
                <input
                  title="company-type"
                  type="text"
                  required
                  value={form.companyType}
                  onChange={(e) => updateField("companyType", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Phone Number
                </label>
                <input
                  title="company-phone-number"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Email
                </label>
                <input
                  title="company-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#F0EDE8] pt-5">
              <p className="text-xs font-medium text-[#78716C]">
                Primary Contact
              </p>
              <div>
                <label className={labelClass}>
                  Contact Name
                </label>
                <input
                  title="company-contact-name"
                  type="text"
                  required
                  value={form.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Contact Phone
                  </label>
                  <input
                    title="company-contact-phone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) =>
                      updateField("contactPhone", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Contact Email
                  </label>
                  <input
                    title="company-contact-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) =>
                      updateField("contactEmail", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#F0EDE8] pt-5">
            <button
              onClick={onClose}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#F0EDE8] bg-white px-4 text-sm font-medium text-[#57534E] transition-colors hover:border-[#DEDAD4] hover:bg-[#FAFAF9]"
            >
              Cancel
            </button>
            <button
              onClick={() => submitForm()}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#FF6B35] bg-[#FF6B35] px-4 text-sm font-medium text-white transition-colors hover:border-[#E85A26] hover:bg-[#E85A26] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FFF4EE]"
            >
              Create Workspace
            </button>
          </div>
        </div>
      </div>

      <CreatingWorkspaceModal show={showCreatingWorkspaceModal} />
    </>
  );
}