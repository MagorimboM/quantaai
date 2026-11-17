import { useState } from "react";
import { createNewProject } from "@/modules/projects/api/api";
import type { CreateNewProjectRequest } from "@/modules/projects/contracts/projects.request.contracts";
import type { ProjectSummary } from "@/modules/projects/contracts/projects.response.contracts";

// Shared classes so every input, label and section looks the same.
const inputClass =
  "w-full rounded-lg border border-[#F0EDE8] bg-[#FAFAF9] px-3 py-1.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#FF6B35] focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-[#FFF4EE]";
const labelClass = "mb-1 block text-xs font-medium text-[#78716C]";
const sectionClass =
  "flex flex-col space-y-3 rounded-xl border border-[#F0EDE8] bg-white p-4 text-[#1C1917]";
const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-wider text-[#A8A29E]";

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

  function updateForm(propertyKey: string, value: string) {
    setProjectForm((prev) => ({
      ...prev,
      [propertyKey as keyof typeof newProjectForm]: value,
    }));
  }

  async function submitNewProjectForm() {
    if (companyId == null || undefined) {
      return;
    }

    console.log(newProjectForm);
    const response = await createNewProject(companyId!, newProjectForm);
    if (response) {
      addToProjectList(response);
      onClose();
    }
    return response;
  }

  return (
    <div
      title="new-project-form"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitNewProjectForm();
        }}
        className="w-full max-w-4xl space-y-4 rounded-2xl border border-[#F0EDE8] bg-[#FAFAF9] p-5 shadow-xl"
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
              <div>
                <label className={labelClass}>
                  Name<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-name"
                  className={inputClass}
                  onChange={(e) => updateForm("projectName", e.target.value)}
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Description<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-description"
                  className={inputClass}
                  onChange={(e) =>
                    updateForm("projectDescription", e.target.value)
                  }
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Project-type<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-type"
                  className={inputClass}
                  onChange={(e) => updateForm("projectType", e.target.value)}
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Site Contact<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-site-contact-name"
                  className={inputClass}
                  onChange={(e) =>
                    updateForm("projectContactName", e.target.value)
                  }
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Site Address<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-address"
                  className={inputClass}
                  onChange={(e) => updateForm("projectAddress", e.target.value)}
                  type="text"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Contact<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-site-contact-phone"
                  className={inputClass}
                  onChange={(e) =>
                    updateForm("projectPhoneNumber", e.target.value)
                  }
                  type="tel"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  City<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-city"
                  className={inputClass}
                  onChange={(e) => updateForm("projectCity", e.target.value)}
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  PostCode<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-postcode"
                  className={inputClass}
                  onChange={(e) =>
                    updateForm("projectPostCode", e.target.value)
                  }
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  State<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-state"
                  className={inputClass}
                  onChange={(e) => updateForm("projectState", e.target.value)}
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Country<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-country"
                  className={inputClass}
                  onChange={(e) => updateForm("projectCountry", e.target.value)}
                  type="text"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Project Number
                  <span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-number"
                  className={inputClass}
                  onChange={(e) => updateForm("projectNumber", e.target.value)}
                  type="text"
                  required
                />
              </div>
            </div>
          </div>
          <div title="project-owner-details" className={sectionClass}>
            <label className={sectionTitleClass}>Client Details˝</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>
                  Name<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-client-name"
                  className={inputClass}
                  onChange={(e) => updateForm("clientName", e.target.value)}
                  type="text"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Email<span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-client-email"
                  className={inputClass}
                  onChange={(e) => updateForm("clientEmail", e.target.value)}
                  type="text"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Phone/Mobile Number
                  <span className="ml-0.5 text-red-600">*</span>
                </label>
                <input
                  title="project-client-phone"
                  className={inputClass}
                  onChange={(e) =>
                    updateForm("clientPhoneNumber", e.target.value)
                  }
                  type="text"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="rounded-lg cursor-pointer bg-[#FF6B35] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#E85A26] focus:outline-none focus:ring-[3px] focus:ring-[#FFF4EE]"
            type="submit"
          >
            Create New Project
          </button>
        </div>
      </form>
    </div>
  );
}