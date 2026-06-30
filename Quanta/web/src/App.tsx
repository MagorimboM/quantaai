import { ProjectsPage } from "@/modules/projects/projectPage";
import { Routes, Route } from "react-router";
import { AppShell } from "@/common/components/appShell";

function App() {
  //! check if the user is authenticated: show appShell : show landing page or a modal message stating the user need to login or signup;
  //! check if the user screen is least size laptop: show the app : ui informing the user the web app needs to be done on aa laptop;
  // ! requirements: Routes for the landing page and its login pages;
  // default return null for now or loading? or splash screen.

  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/" element={<ProjectsPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
