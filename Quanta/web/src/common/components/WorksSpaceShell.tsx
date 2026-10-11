import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { SideBarComp } from "@/common/components/sideBar";
import { useEffect, useState } from "react";
import { fetchCompanyInformation } from "@/common/api/api";

// The frame around every page inside a workspace: the sidebar on the left, a
// top bar with the account menu (profile and sign out, provided by Clerk), and
// the page itself. API errors are shown by the global error banner that wraps
// the whole signed-in app (see App), not here.

export function WorksSpaceShell({ children }: { children: ReactNode }) {
  const [companyInformation, setCompanyInformation] = useState<{
    name: string;
    id: string;
  }>({
    name: "",
    id: "",
  });

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    async function getCompanyInformation() {
      const companyData = await fetchCompanyInformation(companyId!);
      setCompanyInformation(companyData);
    }

    getCompanyInformation();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <SideBarComp />
      <main className="flex h-full w-full flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b p-2.5">
          <div className="flex items-center w-full">
            <h1>{companyInformation.name}</h1>
          </div>

          <div className="flex items-center justify-end w-full">
            <UserButton />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">{children}</div>
      </main>
    </div>
  );
}
