import { Routes, Route, Navigate, Outlet } from "react-router";
import { useAuth } from "@clerk/react";
import { AppShell } from "@/common/components/appShell";
import { GlobalErrorComp } from "@/common/components/globalError";
import { LandingPage } from "@/modules/landing/landing.page";
import { RegisterPage } from "@/modules/landing/auth/register/RegisterPage";
import { LoginPage } from "@/modules/landing/auth/login/LoginPage";
import { WorkspaceSwitcherPage } from "@/modules/workspaceSwitcher/workspace.page";
import { DashBoardPage } from "@/modules/dashboard/dashboard.page";
import { ProjectsPage } from "@/modules/projects/projectPage";
import { RecipeLibraryPage } from "@/modules/recipeLibrary/recipeLibrary.page";
import { BillOfQuantsPage } from "@/modules/quantityTakeoff/quantityTakeOff.page";
import { SettingsPage } from "@/modules/settings/settings.page";
import { ensureScopeBelongsTo } from "@/common/storage/activeScope";

// The frame (sidebar and top bar) shared by every page inside a workspace. As a
// layout route it stays mounted while the user moves between pages, so the
// sidebar keeps its state, such as being collapsed.
function WorkspaceLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

/**
 * The routes of the whole app, in two worlds:
 *
 *  - Signed out: the landing page, log in and register. Anything else goes back
 *    to the landing page.
 *  - Signed in: the workspace switcher at "/", where the person picks a company
 *    or personal workspace, then the pages of that workspace (dashboard,
 *    projects, takeoff, recipes, settings) inside the shared frame.
 *    Anything unknown goes back to the switcher.
 *
 * The switcher is not inside the frame because it has its own header and
 * sidebar. API errors show in the global error banner on every signed-in page.
 */
function App() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  // Clerk needs a moment to confirm the session, so nothing renders until it has:
  // a signed-in person is never shown the signed-out routes, not even briefly.
  if (!isLoaded) {
    // TODO :: replace with a real loading screen once one exists
    return null;
  }

  if (!isSignedIn) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Done while rendering, before any page reads the scope, so no request is ever
  // sent with another person's saved company. It only touches localStorage and
  // does nothing once the owner matches, so repeating it is harmless.
  if (userId) ensureScopeBelongsTo(userId);

  return (
    <GlobalErrorComp>
      <Routes>
        <Route path="/" element={<WorkspaceSwitcherPage />} />
        <Route element={<WorkspaceLayout />}>
          <Route path="/dashboard" element={<DashBoardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/bill-of-quants" element={<BillOfQuantsPage />} />
          <Route path="/recipes" element={<RecipeLibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GlobalErrorComp>
  );
}

export default App;