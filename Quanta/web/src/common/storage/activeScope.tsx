// The workspace the user is currently working inside, read from one place so
// no component has to remember the localStorage key names.
//
//  - workspaceId + companyId are set when the user picks a workspace on the
//    switcher.
//  - projectId is set when the user opens a project.
//  - All three are cleared when they go back to the switcher, and when a new
//    session starts (sign in / sign up), so one person's workspace is never
//    carried over to the next person on the same browser.
//
// A personal workspace has no company, so companyId is null there.

export type ActiveScope = {
  workspaceId: string | null;
  companyId: string | null;
  projectId: string | null;
};

export function getActiveScope(): ActiveScope {
  return {
    // `|| null` also turns an empty string into null
    workspaceId: localStorage.getItem("workspaceId") || null,
    companyId: localStorage.getItem("companyId") || null,
    projectId: localStorage.getItem("projectId") || null,
  };
}

// Called when the user opens a project, so the takeoff, documents and
// assistant pages all know which project they are working on.
export function setActiveProject(projectId: string): void {
  localStorage.setItem("projectId", projectId);
}

// Forgets the workspace, company and project.
export function clearActiveScope(): void {
  localStorage.removeItem("workspaceId");
  localStorage.removeItem("companyId");
  localStorage.removeItem("projectId");
}