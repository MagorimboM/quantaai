import { useState } from "react";
import { MdClose } from "react-icons/md";
import { postNewWorkspace } from "@/modules/workspaceSwitcher/api/api";
import { CreatingWorkspaceModal } from "@/modules/workspaceSwitcher/components/creatingWorkspace.modal";

// TODO :: create modal component showing the creating workspace
// TODO  :: create modal component showing success in creating workspace

export function CreateCompanyWorkspaceForm({
  onClose,
}: {
  onClose: () => void;
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
    setForm((prev) => ({ ...prev, [field]: value.trim() }));
  }

  async function submitForm() {
    // TODO :: submit to the backend
    // TODO :: on success trigger a page reload. or pass page state to this so that it gets updated with the form.
    setShowCreatingWorkspaceModal(true);
    const response = postNewWorkspace(form);
    if (!response) {
      console.log("something is up");
      setShowCreatingWorkspaceModal(false);
      return;
    }
    setShowCreatingWorkspaceModal(false);
    onClose();
  }

  return (
    <>
      <div
        title="background"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          title="create-workspace-form"
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-lg"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <h1 className="text-lg font-semibold text-foreground">
              Create Company Workspace
            </h1>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Company Name
              </label>
              <input
                title="company-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Address
              </label>
              <input
                title="company-address"
                type="text"
                required
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  City
                </label>
                <input
                  title="company-city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  State
                </label>
                <input
                  title="company-state"
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Postcode
                </label>
                <input
                  title="company-postcode"
                  type="text"
                  required
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Country
                </label>
                <input
                  title="company-country"
                  type="text"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Company Type
                </label>
                <input
                  title="company-type"
                  type="text"
                  required
                  value={form.companyType}
                  onChange={(e) => updateField("companyType", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Phone Number
                </label>
                <input
                  title="company-phone-number"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  title="company-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Primary Contact
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Contact Name
                </label>
                <input
                  title="company-contact-name"
                  type="text"
                  required
                  value={form.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Contact Phone
                  </label>
                  <input
                    title="company-contact-phone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) =>
                      updateField("contactPhone", e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Contact Email
                  </label>
                  <input
                    title="company-contact-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) =>
                      updateField("contactEmail", e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => submitForm()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
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
