import { apiClient } from "@/core/api/axios.api";

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

export async function postNewWorkspace(request: {
  name: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  companyType: string;
}) {
  const response = await apiClient.post("workspaces/create", request);
  return response.data;
}

// TODO :: [backend] this endpoint does not exist yet. Needs a new NestJS
// route returning every project the authenticated user owns across every
// company, sorted by dueDate ASC then updatedAt DESC. Every existing project
// query (getListOfProjects) is scoped to a single companyId -- this is new
// repository + controller work, not an existing route to reuse.
// NOTE :: returning dummy data until that endpoint exists -- kept async so
// swapping back to the real apiClient.get(...) call later needs no changes
// at any call site.
export async function getAllProjects() {
  return [
    {
      id: "dummy-proj-001",
      companyId: "seed-company-001",
      name: "Smith Residence",
      companyName: "ABC Construction",
      dueDate: "2026-10-08",
    },
    {
      id: "dummy-proj-002",
      companyId: "seed-company-002",
      name: "Malaga Industrial Shed",
      companyName: "XYZ Builders",
      dueDate: "2026-10-15",
    },
    {
      id: "dummy-proj-003",
      companyId: "seed-company-003",
      name: "Fremantle Boardwalk Slab",
      companyName: "Coastal Concrete Co",
      dueDate: "2026-11-01",
    },
    {
      id: "dummy-proj-004",
      companyId: "seed-company-001",
      name: "Turner Extension",
      companyName: "ABC Construction",
      updatedAt: "2 hours ago",
    },
    {
      id: "dummy-proj-005",
      companyId: "seed-company-002",
      name: "Warehouse Reroof",
      companyName: "XYZ Builders",
      updatedAt: "1 day ago",
    },
  ];

}