import { ProjectsPage } from "@/modules/projects/projectPage";
import { Routes, Route } from "react-router";
import { AppShell } from "@/common/components/appShell";
import { RecipeLibraryPage } from "@/modules/recipeLibrary/recipeLibrary.page";
import { SettingsPage } from "@/modules/settings/settings.page";
import { BillOfQuantsPage } from "@/modules/quantityTakeoff/quantityTakeOff.page";
import { DashBoardPage } from "@/modules/dashboard/dashboard.page";
import { WorkspaceSwitcherPage } from "@/modules/workspaceSwitcher/workspace.page";
import { HomeShell } from "@/common/components/homeShell";

function App() {
  // TODO :: check of the workspaceid is there:

  /* const workspaceId = localStorage.getItem("workspaceId");

  if (workspaceId == null || workspaceId?.length == 0) {
    return <HomeShell/>;
  };  */

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<WorkspaceSwitcherPage />} />
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
