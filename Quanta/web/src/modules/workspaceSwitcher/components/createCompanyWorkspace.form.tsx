import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { postNewWorkspace } from "@/modules/workspaceSwitcher/api/api";
import { CreatingWorkspaceModal } from "@/modules/workspaceSwitcher/components/creatingWorkspace.modal";
import {
  validateCompanyWorkspace,
  type CompanyWorkspaceField,
} from "@/modules/workspaceSwitcher/contracts/createCompanyWorkspace.schema";

// The most a policy PDF can weigh (the backend has the same limit)
const MAX_POLICY_BYTES = 10 * 1024 * 1024;

// Shared look for every field in this form
const labelClass = "mb-1.5 block text-sm font-medium text-[#57534E]";
function inputClass(hasError: boolean) {
  return `h-12 w-full rounded-lg border bg-white px-3.5 text-[15px] text-[#1C1917] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#A8A29E] focus:ring-[3px] ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-50"
      : "border-[#DEDAD4] focus:border-[#FF6B35] focus:ring-[#FFF4EE]"
  }`;
}

// The file picker, styled to match the other inputs. The browser's own
// "Choose file" button is reached with Tailwind's file: variant.
function fileInputClass(hasError: boolean) {
  return [
    "block w-full cursor-pointer rounded-lg border bg-white text-sm text-[#57534E] transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-[3px]",
    hasError
      ? "border-red-500 focus:ring-red-50"
      : "border-[#DEDAD4] focus:border-[#FF6B35] focus:ring-[#FFF4EE]",
    "file:mr-3 file:h-12 file:cursor-pointer file:border-0 file:border-r file:border-[#DEDAD4] file:bg-[#FAFAF9] file:px-4 file:text-sm file:font-medium file:text-[#1C1917] hover:file:bg-[#F0EDE8]",
  ].join(" ");
}

// The phone fields use react-phone-number-input's own PhoneInput: a flag
// dropdown plus the number. Its stylesheet isn't imported, so it is styled here
// with Tailwind, reaching its parts by their class names:
//   .PhoneInputCountry        the flag and arrow, with the real <select> laid
//   .PhoneInputCountrySelect  invisibly over them so a click opens it
//   .PhoneInputCountryIcon    the flag
//   .PhoneInputCountrySelectArrow  the small chevron
//   .PhoneInputInput          the number box
// It matches the other inputs, and its border turns red when the number is wrong.
function phoneInputClass(hasError: boolean) {
  return [
    "flex h-12 w-full items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-[border-color,box-shadow] duration-150 focus-within:ring-[3px]",
    hasError
      ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-50"
      : "border-[#DEDAD4] focus-within:border-[#FF6B35] focus-within:ring-[#FFF4EE]",
    "[&_.PhoneInputCountry]:relative [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:shrink-0 [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:gap-1.5",
    "[&_.PhoneInputCountrySelect]:absolute [&_.PhoneInputCountrySelect]:inset-0 [&_.PhoneInputCountrySelect]:z-10 [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputCountrySelect]:opacity-0",
    "[&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:overflow-hidden [&_.PhoneInputCountryIcon]:rounded-[2px] [&_.PhoneInputCountryIcon]:shadow-[0_0_0_1px_rgba(0,0,0,0.12)]",
    "[&_.PhoneInputCountryIcon_svg]:block [&_.PhoneInputCountryIcon_svg]:h-full [&_.PhoneInputCountryIcon_svg]:w-full",
    "[&_.PhoneInputCountrySelectArrow]:-mt-0.5 [&_.PhoneInputCountrySelectArrow]:size-1.5 [&_.PhoneInputCountrySelectArrow]:rotate-45 [&_.PhoneInputCountrySelectArrow]:border-b-[1.5px] [&_.PhoneInputCountrySelectArrow]:border-r-[1.5px] [&_.PhoneInputCountrySelectArrow]:border-[#78716C]",
    "[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-[15px] [&_.PhoneInputInput]:text-[#1C1917] [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-[#A8A29E]",
  ].join(" ");
}

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

// TODO :: create modal component showing success in creating workspace

type CompanyForm = Record<CompanyWorkspaceField, string>;

/**
 * The form for a new company workspace. Every text field is checked by the Zod
 * schema in createCompanyWorkspace.schema.ts (the same rules the backend
 * checks again).
 *
 * A field's error shows once the user has left it, or for every field once they
 * try to submit, so nothing flashes red while they are still typing. The errors
 * then update as they type.
 *
 * The company's quants takeoff policy is an optional PDF. It is kept in its own
 * state (it isn't text) and checked when it is chosen: it must be a PDF of
 * 10 MB or less. The backend checks it again and reads its text.
 */
export function CreateCompanyWorkspaceForm({
  onClose,
  addToList,
}: {
  onClose: () => void;
  addToList: (newCompany: any) => void;
}) {
  const [form, setForm] = useState<CompanyForm>({
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

  const [companyPolicyFile, setCompanyPolicyFile] = useState<File | null>(null);
  const [policyFileError, setPolicyFileError] = useState<string | null>(null);

  const [touched, setTouched] = useState<
    Partial<Record<CompanyWorkspaceField, boolean>>
  >({});
  const [triedToSubmit, setTriedToSubmit] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCreatingWorkspaceModal, setShowCreatingWorkspaceModal] =
    useState<boolean>(false);

  // Keeps the chosen file if it's a PDF under the size limit. Otherwise it
  // shows why and keeps nothing.
  function saveUploadedCompanyPolicy(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) {
      setCompanyPolicyFile(null);
      setPolicyFileError(null);
      return;
    }

    const looksLikePdf =
      uploadedFile.type === "application/pdf" ||
      uploadedFile.name.toLowerCase().endsWith(".pdf");

    if (!looksLikePdf) {
      setCompanyPolicyFile(null);
      setPolicyFileError("The policy must be a PDF.");
    } else if (uploadedFile.size > MAX_POLICY_BYTES) {
      setCompanyPolicyFile(null);
      setPolicyFileError("The policy must be 10 MB or smaller.");
    } else {
      setCompanyPolicyFile(uploadedFile);
      setPolicyFileError(null);
    }
  }

  // Checked on every render, so the messages follow what the user types
  const { errors } = validateCompanyWorkspace(form);
  const errorFor = (field: CompanyWorkspaceField) =>
    triedToSubmit || touched[field] ? errors[field] : undefined;

  function updateField(field: CompanyWorkspaceField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function touch(field: CompanyWorkspaceField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function submitForm() {
    setTriedToSubmit(true);
    const { data } = validateCompanyWorkspace(form);
    if (!data || policyFileError) return;

    setSubmitError(null);
    setShowCreatingWorkspaceModal(true);
    try {
      // Send the checked values (trimmed, with the phones in +61 form) and the
      // policy file, if one was chosen
      const response = await postNewWorkspace(
        data,
        companyPolicyFile ?? undefined,
      );
      if (!response) {
        setSubmitError("Couldn't create the workspace. Please try again.");
        return;
      }
      addToList(response);
      onClose();
    } catch (error: any) {
      // Show the backend's reason when it gives one (a name already used, a
      // PDF it couldn't read), otherwise a general message
      const message = error?.response?.data?.message;
      setSubmitError(
        typeof message === "string"
          ? message
          : "Couldn't create the workspace. Please try again.",
      );
    } finally {
      setShowCreatingWorkspaceModal(false);
    }
  }

  // One labelled text input, with its error underneath
  function textField(
    field: CompanyWorkspaceField,
    label: string,
    title: string,
    options: { type?: "text" | "email"; required?: boolean } = {},
  ) {
    const { type = "text", required = true } = options;
    const error = errorFor(field);
    return (
      <div>
        <label htmlFor={title} className={labelClass}>
          {label}
          {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        </label>
        <input
          id={title}
          title={title}
          type={type}
          value={form[field]}
          onChange={(e) => updateField(field, e.target.value)}
          onBlur={() => touch(field)}
          aria-invalid={error !== undefined}
          className={inputClass(error !== undefined)}
        />
        <FieldError message={error} />
      </div>
    );
  }

  // One labelled phone input, with its error underneath
  function phoneField(
    field: "phone" | "contactPhone",
    label: string,
    title: string,
    required: boolean,
  ) {
    const error = errorFor(field);
    return (
      <div>
        <label htmlFor={title} className={labelClass}>
          {label}
          {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        </label>
        <PhoneInput
          id={title}
          title={title}
          defaultCountry="AU"
          flags={flags}
          placeholder="0412 345 678"
          value={form[field]}
          // PhoneInput gives undefined for an empty box; the form keeps ""
          onChange={(value) => updateField(field, value ?? "")}
          onBlur={() => touch(field)}
          aria-invalid={error !== undefined}
          className={phoneInputClass(error !== undefined)}
        />
        <FieldError message={error} />
      </div>
    );
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
          className="flex max-h-[92vh] w-full max-w-5xl flex-col gap-6 overflow-y-auto rounded-2xl border border-[#F0EDE8] bg-white p-8 text-[#1C1917]"
        >
          <div className="flex items-center justify-between border-b border-[#F0EDE8] pb-4">
            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#1C1917]">
              Create Company Workspace
            </h1>
            <button
              onClick={onClose}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#78716C] transition-colors hover:bg-[#FAFAF9] hover:text-[#1C1917]"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {textField("name", "Company Name", "company-name")}
            {textField("address", "Address", "company-address")}

            <div className="grid grid-cols-3 gap-4">
              {textField("city", "City", "company-city")}
              {textField("state", "State", "company-state")}
              {textField("postcode", "Postcode", "company-postcode")}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {textField("country", "Country", "company-country")}
              {textField("companyType", "Company Type", "company-type")}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {phoneField(
                "phone",
                "Phone Number",
                "company-phone-number",
                true,
              )}
              {textField("email", "Email", "company-email", { type: "email" })}
            </div>

            <div>
              <label
                htmlFor="company-policy-file-upload"
                className={labelClass}
              >
                Company Quants Takeoff Policy
              </label>
              <input
                id="company-policy-file-upload"
                title="company-policy-file-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={saveUploadedCompanyPolicy}
                aria-invalid={policyFileError !== null}
                className={fileInputClass(policyFileError !== null)}
              />
              <p className="mt-1 text-xs text-[#78716C]">
                Optional. A PDF up to 10 MB.
              </p>
              <FieldError message={policyFileError} />
            </div>

            <div className="flex flex-col gap-4 border-t border-[#F0EDE8] pt-6">
              <p className="text-sm font-medium text-[#78716C]">
                Primary Contact
              </p>
              {textField("contactName", "Contact Name", "company-contact-name")}
              <div className="grid grid-cols-2 gap-4">
                {phoneField(
                  "contactPhone",
                  "Contact Phone",
                  "company-contact-phone",
                  false,
                )}
                {textField(
                  "contactEmail",
                  "Contact Email",
                  "company-contact-email",
                  {
                    type: "email",
                    required: false,
                  },
                )}
              </div>
            </div>
          </div>

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-[#F0EDE8] pt-5">
            <button
              onClick={onClose}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-[#F0EDE8] bg-white px-4 text-sm font-medium text-[#57534E] transition-colors hover:border-[#DEDAD4] hover:bg-[#FAFAF9]"
            >
              Cancel
            </button>
            <button
              onClick={() => submitForm()}
              disabled={showCreatingWorkspaceModal}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-[#FF6B35] bg-[#FF6B35] px-4 text-sm font-medium text-white transition-colors hover:border-[#E85A26] hover:bg-[#E85A26] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FFF4EE] disabled:cursor-not-allowed disabled:opacity-50"
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