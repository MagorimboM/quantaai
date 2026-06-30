import React from "react";
import { SideBar } from "@/common/components/sideBar";
import { GlobalError } from "@/common/components/globalError";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlobalError>
      <div className="flex h-screen w-screen overflow-hidden">
        <SideBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </GlobalError>
  );
}
