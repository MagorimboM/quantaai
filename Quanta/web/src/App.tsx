import { ProjectsPage } from "@/modules/projects/projectPage";
import { Routes, Route } from "react-router";
import { AppShell } from "@/common/components/appShell";
import { RecipeLibraryPage } from "@/modules/recipeLibrary/recipeLibrary.page";
import { SettingsPage } from "@/modules/settings/settings.page";
import { BillOfQuantsPage } from "@/modules/quantityTakeoff/quantityTakeOff.page";
import { DashBoardPage } from "@/modules/dashboard/dashboard.page";
import { WorkspaceSwitcherPage } from "@/modules/workspaceSwitcher/workspace.page";
import { HomeShell } from "@/common/components/homeShell";
import { RecipeBuilderFormPage } from "@/modules/recipeBuilder/recipeBuilder.form.page";
import { LandingPage } from "@/modules/landing/landing.page";
import {RegisterPage} from "@/modules/landing/auth/register/RegisterPage"
import {LoginPage} from "@/modules/landing/auth/login/LoginPage"
import { useState, useEffect } from "react";

// TODO :: fix the flow, implement proper flow between pages.
// TODO :: build real login/register pages -- currently both fall back to LandingPage.

function App() {
  const [loggedIn, setLoggedIn] = useState<any>(false);
  // check if loggedIn

  useEffect(() => {
    // check if user is logged in
    // if user is logged in then update state ( though need to check if this holds or if page is refreshed this wont be disturbed)
  }, []);

  if (loggedIn == true) {
    return (
      <AppShell>
        <Routes>
          <Route path="*" element={<DashBoardPage />} />
          <Route path="/dashboard" element={<DashBoardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/recipes" element={<RecipeLibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/projects/bill-of-quants"
            element={<BillOfQuantsPage />}
          />
        </Routes>
      </AppShell>
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