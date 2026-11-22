import { apiClient } from "@/core/api/axios.api";
import type { CompanyWorkspaceFields } from "@/modules/workspaceSwitcher/contracts/createCompanyWorkspace.schema";

export async function getWorkspaces() {
  const response = await apiClient.get("/workspaces");
  return response.data;
}

export async function getUserWorkspace() {
  const response = await apiClient.get("/workspaces/personal");
  if (response.data.length == 0) {
    return {
      id: "",
      name: "",
      numberOfProjects: 0,
      numberOfRecipes: 0,
    };
  }
  return response.data;
}

// Creates a company workspace. It is sent as multipart form data so the
// optional policy PDF can go along with the fields. The file's field name
// ("file") must match FileInterceptor('file') on the backend.
//
// The Content-Type header is set so axios sends real multipart data even if
// apiClient defaults to JSON (it would otherwise turn the FormData into JSON
// and drop the file). Axios adds the boundary itself.
export async function postNewWorkspace(
  fields: CompanyWorkspaceFields,
  policyFile?: File,
) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value ?? "");
  }
  if (policyFile) formData.append("file", policyFile);

  const response = await apiClient.post("workspaces/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getAllProjects() {
  const response = await apiClient.get("workspaces/due-projects");
  return response.data;
}