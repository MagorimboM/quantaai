import React from "react";
import { SideBarComp } from "@/common/components/sideBar";
import { GlobalErrorComp } from "@/common/components/globalError";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorComp>
      <div className="flex h-screen w-screen overflow-hidden">
        <SideBarComp />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </GlobalErrorComp>
  );
}
