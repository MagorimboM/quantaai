import { ProjectsPage } from "@/modules/projects/projectPage";
import { Routes, Route } from "react-router";
import { AppShell } from "@/common/components/appShell";
import { RecipeLibraryPage } from "@/modules/recipeLibrary/recipeLibrary.page";
import { SettingsPage } from "@/modules/settings/settings.page";
import { BillOfQuantsPage } from "@/modules/quantityTakeoff/quantityTakeOff.page";
import { DashBoardPage } from "@/modules/dashboard/dashboard.page";
//import { WorkspaceSwitcherPage } from "@/modules/workspaceSwitcher/workspace.page";
//import { HomeShell } from "@/common/components/homeShell";
//import { RecipeBuilderFormPage } from "@/modules/recipeBuilder/recipeBuilder.form.page";
import { LandingPage } from "@/modules/landing/landing.page";
import {RegisterPage} from "@/modules/landing/auth/register/RegisterPage"
import {LoginPage} from "@/modules/landing/auth/login/LoginPage"
import { useState, useEffect } from "react";

// TODO :: fix the flow, implement proper flow between pages.
// NOTE :: [build-fix] this is an interim check only -- it just looks for a locally-stored
// flag, matching the pattern already used elsewhere (BillOfQuantsPage checks localStorage
// for scope ids the same way). It is NOT real authentication: nothing here verifies the
// flag against a real session on the backend. Replace this once the real auth guard/`/me`
// endpoint exists, per the auth TODO list.

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem("loggedIn");
    setLoggedIn(storedLoggedIn === "true");
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