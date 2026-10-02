import { ProjectsPage } from "@/modules/projects/projectPage";
import { Routes, Route } from "react-router";
import { AppShell } from "@/common/components/appShell";
import { RecipeLibraryPage } from "@/modules/recipeLibrary/recipeLibrary.page";
import { SettingsPage } from "@/modules/settings/settings.page";
import { BillOfQuantsPage } from "@/modules/quantityTakeoff/quantityTakeOff.page";
import { DashBoardPage } from "@/modules/dashboard/dashboard.page";
import { WorkspaceSwitcherPage } from "@/modules/workspaceSwitcher/workspace.page";
//import { RecipeBuilderFormPage } from "@/modules/recipeBuilder/recipeBuilder.form.page";
import { LandingPage } from "@/modules/landing/landing.page";
import { RegisterPage } from "@/modules/landing/auth/register/RegisterPage";
import { LoginPage } from "@/modules/landing/auth/login/LoginPage";
import { useAuth } from "@clerk/react";

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Routes>
        <Route path="*" element={<WorkspaceSwitcherPage />} />
        <Route path="/" element={<WorkspaceSwitcherPage />} />
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <DashBoardPage />
            </AppShell>
          }
        />
        <Route
          path="/projects"
          element={
            <AppShell>
              <ProjectsPage />
            </AppShell>
          }
        />
        <Route
          path="/recipes"
          element={
            <AppShell>
              <RecipeLibraryPage />
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            <AppShell>
              <SettingsPage />
            </AppShell>
          }
        />
        <Route
          path="/projects/bill-of-quants"
          element={
            <AppShell>
              <BillOfQuantsPage />
            </AppShell>
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
