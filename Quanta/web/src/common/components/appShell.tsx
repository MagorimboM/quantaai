import React from "react";
import { SideBarComp } from "@/common/components/sideBar";
import { GlobalErrorComp } from "@/common/components/globalError";
import { MdOutlineNotifications, MdOutlineAccountCircle } from "react-icons/md";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorComp>
      <div className="flex h-screen w-screen overflow-hidden">
        <SideBarComp />
        <main className="flex-1 flex-col overflow-auto">
          <div className="flex border-b-1 justify-end gap-2 p-2.5">
            <button
              title="notifications"
              className="rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
            <MdOutlineNotifications size={24} />
            </button>
            <button
              title="account"
              className="rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              <MdOutlineAccountCircle size={24} />
            </button>
          </div>
          {children}
        </main>
      </div>
    </GlobalErrorComp>
  );
}
