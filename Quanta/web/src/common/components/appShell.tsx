import type { ReactNode } from "react";
import { UserButton } from "@clerk/react";
import { SideBarComp } from "@/common/components/sideBar";

// The frame around every page inside a workspace: the sidebar on the left, a
// top bar with the account menu (profile and sign out, provided by Clerk), and
// the page itself. API errors are shown by the global error banner that wraps
// the whole signed-in app (see App), not here.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <SideBarComp />
      <main className="flex h-full w-full flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-end gap-2 border-b p-2.5">
          <UserButton />
        </div>

        <div className="flex min-h-0 flex-1">{children}</div>
      </main>
    </div>
  );
}