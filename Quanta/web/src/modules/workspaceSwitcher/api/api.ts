import { apiClient } from "@/core/api/axios.api";

export async function getWorkspaces() {
  // send a request to get workspaces

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
