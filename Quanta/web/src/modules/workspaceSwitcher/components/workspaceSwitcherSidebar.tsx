import { MdOutlineSettings, MdOutlineHelpOutline, MdLogout } from "react-icons/md";
import { HiOutlineCube } from "react-icons/hi2";

export function WorkspaceSwitcherSidebar() {
  return (
    <div className="flex w-full items-center justify-between border-b bg-card px-6 py-3 text-card-foreground">
      <div className="flex flex-row items-center gap-2">
        <HiOutlineCube size={24} className="text-primary" />
        <h1 className="text-lg font-semibold text-foreground">Quanta</h1>
      </div>

      <div className="flex flex-row items-center gap-1">
        <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted cursor-pointer">
          <MdOutlineSettings size={18} className="text-muted-foreground" />
          Settings
        </button>
        <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted cursor-pointer">
          <MdOutlineHelpOutline size={18} className="text-muted-foreground" />
          Help &amp; Support
        </button>
      </div>

      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-row items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            U
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-foreground">User</span>
            <span className="truncate text-xs text-muted-foreground">user@example.com</span>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-destructive cursor-pointer">
          <MdLogout size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}