import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { createNewProject } from "@/modules/projects/api/api";
import type { CreateNewProjectRequest } from "@/modules/projects/contracts/projects.request.contracts";
import type { ProjectSummary } from "@/modules/projects/contracts/projects.response.contracts";
import {
  validateNewProject,
  type NewProjectField,
} from "@/modules/projects/contracts/newProjectForm.schema";

// Shared classes so every input, label and section looks the same.
function inputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-[#FAF8F5] px-3 py-1.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:bg-white focus:outline-none focus:ring-[3px] ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-50"
      : "border-[#EFECE6] focus:border-[#FF6B4A] focus:ring-[#FFF4EE]"
  }`;
}
const labelClass = "mb-1 block text-xs font-medium text-[#78716C]";
const sectionClass =
  "flex flex-col space-y-3 rounded-xl border border-[#EFECE6] bg-white p-4 text-[#1C1917]";
const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-wider text-[#A8A29E]";

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
    "flex h-[34px] w-full items-center gap-2 rounded-lg border bg-[#FAF8F5] px-3 transition-colors focus-within:bg-white focus-within:ring-[3px]",
    hasError
      ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-50"
      : "border-[#EFECE6] focus-within:border-[#FF6B4A] focus-within:ring-[#FFF4EE]",
    "[&_.PhoneInputCountry]:relative [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:shrink-0 [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:gap-1.5",
    "[&_.PhoneInputCountrySelect]:absolute [&_.PhoneInputCountrySelect]:inset-0 [&_.PhoneInputCountrySelect]:z-10 [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputCountrySelect]:opacity-0",
    "[&_.PhoneInputCountryIcon]:h-3.5 [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:overflow-hidden [&_.PhoneInputCountryIcon]:rounded-[2px] [&_.PhoneInputCountryIcon]:shadow-[0_0_0_1px_rgba(0,0,0,0.12)]",
    "[&_.PhoneInputCountryIcon_svg]:block [&_.PhoneInputCountryIcon_svg]:h-full [&_.PhoneInputCountryIcon_svg]:w-full",
    "[&_.PhoneInputCountrySelectArrow]:-mt-0.5 [&_.PhoneInputCountrySelectArrow]:size-1.5 [&_.PhoneInputCountrySelectArrow]:rotate-45 [&_.PhoneInputCountrySelectArrow]:border-b-[1.5px] [&_.PhoneInputCountrySelectArrow]:border-r-[1.5px] [&_.PhoneInputCountrySelectArrow]:border-[#78716C]",
    "[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-[#1C1917] [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-[#78716C]",
  ].join(" ");
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

/**
 * The form for a new project. Every field is checked by the Zod schema in
 * newProject.schema.ts (the same rules the backend can check again).
 *
 * A field's error shows once the user has left it, or for every field once they
 * try to submit, so nothing flashes red while they are still typing. The errors
 * then update as they type.
 */
export function NewProjectForm({
  onClose,
  addToProjectList,
}: {
  onClose: () => void;
  addToProjectList: (project: ProjectSummary) => void;
}) {
  const companyId = localStorage.getItem("companyId");
  const [newProjectForm, setProjectForm] = useState<CreateNewProjectRequest>({
    projectState: "",
    projectCountry: "",
    projectNumber: "",
    projectName: "",
    projectDescription: "",
    projectContactName: "",
    projectPhoneNumber: "",
    projectAddress: "",
    projectCity: "",
    projectPostCode: null,
    projectType: "",
    projectContact: null,
    clientName: "",
    clientEmail: "",
    clientPhoneNumber: "",
  });

  const [touched, setTouched] = useState<
    Partial<Record<NewProjectField, boolean>>
  >({});
  const [triedToSubmit, setTriedToSubmit] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Checked on every render, so the messages follow what the user types
  const { errors } = validateNewProject(newProjectForm);
  const errorFor = (field: NewProjectField) =>
    triedToSubmit || touched[field] ? errors[field] : undefined;

  function updateForm(field: NewProjectField, value: string) {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
  }

  function touch(field: NewProjectField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function submitNewProjectForm() {
    if (!companyId) return;

    setTriedToSubmit(true);
    const { data } = validateNewProject(newProjectForm);
    if (!data) return;

    setSubmitError(null);
    setIsSaving(true);
    try {
      // Send the checked values: trimmed, with the phones in +61 form
      const response = await createNewProject(companyId, {
        ...newProjectForm,
        ...data,
      });
      if (response) {
        addToProjectList(response);
        onClose();
      } else {
        setSubmitError("Couldn't create the project. Please try again.");
      }
    } catch {
      setSubmitError("Couldn't create the project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // One labelled text input, with its error underneath
  function textField(
    field: NewProjectField,
    label: string,
    title: string,
    type: "text" | "email" = "text",
  ) {
    const error = errorFor(field);
    return (
      <div>
        <label htmlFor={title} className={labelClass}>
          {label}
          <span className="ml-0.5 text-red-600">*</span>
        </label>
        <input
          id={title}
          title={title}
          type={type}
          className={inputClass(error !== undefined)}
          value={
            (newProjectForm[field as keyof CreateNewProjectRequest] as
              | string
              | null) ?? ""
          }
          onChange={(e) => updateForm(field, e.target.value)}
          onBlur={() => touch(field)}
          aria-invalid={error !== undefined}
        />
        <FieldError message={error} />
      </div>
    );
  }

  // One labelled phone input, with its error underneath
  function phoneField(
    field: "projectPhoneNumber" | "clientPhoneNumber",
    label: string,
    title: string,
  ) {
    const error = errorFor(field);
    return (
      <div>
        <label htmlFor={title} className={labelClass}>
          {label}
          <span className="ml-0.5 text-red-600">*</span>
        </label>
        <PhoneInput
          id={title}
          title={title}
          defaultCountry="AU"
          flags={flags}
          placeholder="0412 345 678"
          value={newProjectForm[field]}
          // PhoneInput gives undefined for an empty box; the form keeps ""
          onChange={(value) => updateForm(field, value ?? "")}
          onBlur={() => touch(field)}
          aria-invalid={error !== undefined}
          className={phoneInputClass(error !== undefined)}
        />
        <FieldError message={error} />
      </div>
    );
  }

  return (
    <div
      title="new-project-form"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30 p-4 backdrop-blur-sm"
    >
      <form
        // Zod does the checking, so the browser's own "fill in this field"
        // bubbles are turned off
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submitNewProjectForm();
        }}
        className="w-full max-w-4xl space-y-4 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-[#1C1917]">
            Enter Details Of New Projects
          </h1>
          <button
            type="button"
            onClick={onClose}
            className=" cursor-pointer rounded-lg border px-3 py-1 text-sm text-[#78716C] hover:border-[#FFD9C9] hover:bg-[#FFF4EE] hover:text-[#1C1917]"
          >
            x
          </button>
        </div>
        <div className="space-y-4">
          <div title="project-details" className={sectionClass}>
            <label className={sectionTitleClass}>Project Details</label>
            <div className="grid grid-cols-3 gap-3">
              {textField("projectName", "Name", "project-name")}
              {textField(
                "projectDescription",
                "Description",
                "project-description",
              )}
              {textField("projectType", "Project-type", "project-type")}
              {textField(
                "projectContactName",
                "Site Contact",
                "project-site-contact-name",
              )}
              {textField("projectAddress", "Site Address", "project-address")}
              {phoneField(
                "projectPhoneNumber",
                "Contact Phone",
                "project-site-contact-phone",
              )}
              {textField("projectCity", "City", "project-city")}
              {textField("projectPostCode", "PostCode", "project-postcode")}
              {textField("projectState", "State", "project-state")}
              {textField("projectCountry", "Country", "project-country")}
              {textField("projectNumber", "Project Number", "project-number")}
            </div>
          </div>
          <div title="project-owner-details" className={sectionClass}>
            <label className={sectionTitleClass}>Client Details</label>
            <div className="grid grid-cols-3 gap-3">
              {textField("clientName", "Name", "project-client-name")}
              {textField(
                "clientEmail",
                "Email",
                "project-client-email",
                "email",
              )}
              {phoneField(
                "clientPhoneNumber",
                "Phone/Mobile Number",
                "project-client-phone",
              )}
            </div>
          </div>
        </div>

        {submitError ? (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            className="rounded-lg cursor-pointer bg-[#FF6B4A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#F25C3C] focus:outline-none focus:ring-[3px] focus:ring-[#FFF4EE] disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Creating…" : "Create New Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
