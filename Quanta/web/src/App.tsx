import { ProjectsPage } from "@/modules/projects/projectPage";
import { Routes, Route } from "react-router";
import { AppShell } from "@/common/components/appShell";

function App() {
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
