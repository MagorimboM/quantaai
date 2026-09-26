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
import {LandingPage} from "@/modules/landing/landing.page"

// TODO :: fix the flow, implement proper flow between pages. 

function App() {

  // on mount Check if the user is logged in or there is cookies. 
  // if user is logged in take them to the workspace switcher routes
  // if the user is not logged in take them to the landing page. 
  // if the user has an expired token take them to the landing page and let them know that their session is expired
  
  

    const workspaceId = localStorage.getItem("workspaceId");
  const companyId = localStorage.getItem("companyId"); 

  if (workspaceId == null || workspaceId?.length == 0 || workspaceId == "") {
    return <LandingPage />;
  } 

  return (
    <AppShell>
      <Routes>
        <Route path="*" element={<DashBoardPage />} />
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/recipes" element={<RecipeLibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/projects/bill-of-quants" element={<BillOfQuantsPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
