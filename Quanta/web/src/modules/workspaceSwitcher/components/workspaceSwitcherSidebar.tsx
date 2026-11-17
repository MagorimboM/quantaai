import { MdOutlineSettings, MdOutlineHelpOutline, MdLogout } from "react-icons/md";
import { HiOutlineCube } from "react-icons/hi2";
import { useNavigate } from "react-router";
import { useUser, useClerk } from "@clerk/react";

// Settings opens the settings page and Log out signs the person out. Help &
// Support has no destination in the app yet, so it is a TODO rather than a
// link to a placeholder page.

export function WorkspaceSwitcherSidebar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.fullName ?? user?.firstName ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initial = (user?.firstName?.[0] ?? "U").toUpperCase();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div
      className="flex w-full items-center justify-between px-10 py-3"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #F0EDE8" }}
    >
      <div className="flex flex-row items-center gap-2">
        <HiOutlineCube size={22} style={{ color: "#FF6B35" }} />
        <h1 className="font-display font-800 text-base tracking-widest" style={{ color: "#1C1917" }}>
          QUANTA
        </h1>
      </div>

      <div className="flex flex-row items-center gap-1">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer"
          style={{ color: "#57534E" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <MdOutlineSettings size={18} style={{ color: "#78716C" }} />
          Settings
        </button>
        {/* TODO :: no Help & Support destination exists in the app yet */}
        <button
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer"
          style={{ color: "#57534E" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <MdOutlineHelpOutline size={18} style={{ color: "#78716C" }} />
          Help &amp; Support
        </button>
      </div>

      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-row items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: "#FF6B35", color: "#FFFFFF" }}
          >
            {initial}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium" style={{ color: "#1C1917" }}>
              {displayName}
            </span>
            <span className="truncate text-xs" style={{ color: "#A8A29E" }}>
              {email}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer"
          style={{ color: "#78716C" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFF4EE";
            e.currentTarget.style.color = "#E85A26";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#78716C";
          }}
        >
          <MdLogout size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}