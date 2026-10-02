import {
  MdOutlineSettings,
  MdOutlineHelpOutline,
  MdLogout,
} from "react-icons/md";
import { HiOutlineCube } from "react-icons/hi2";
import { useNavigate } from "react-router";
import { useUser, useClerk } from "@clerk/react";

// TODO :: not sure if i need settings but check to see what the quantity surveyor does with the settings. 

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
      className="flex w-full items-center justify-between px-6 py-3"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #F3DEC0" }}
    >
      <div className="flex flex-row items-center gap-2">
        <HiOutlineCube size={22} style={{ color: "#FF6B35" }} />
        <h1
          className="font-display font-800 text-lg tracking-widest"
          style={{ color: "#2B1B0E" }}
        >
          QUANTA
        </h1>
      </div>

      <div className="flex flex-row items-center gap-1">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono transition-colors cursor-pointer"
          style={{ color: "#2B1B0E" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF4EA")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <MdOutlineSettings size={18} style={{ color: "#9C7B4F" }} />
          Settings
        </button>
        {/* TODO :: no Help & Support destination exists in the app yet */}
        <button
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono transition-colors cursor-pointer"
          style={{ color: "#2B1B0E" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF4EA")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <MdOutlineHelpOutline size={18} style={{ color: "#9C7B4F" }} />
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
            <span
              className="truncate text-sm font-medium font-mono"
              style={{ color: "#2B1B0E" }}
            >
              {displayName}
            </span>
            <span
              className="truncate text-xs font-mono"
              style={{ color: "#B89B6E" }}
            >
              {email}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono transition-colors cursor-pointer"
          style={{ color: "#9C7B4F" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFF4EA";
            e.currentTarget.style.color = "#B85C4F";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#9C7B4F";
          }}
        >
          <MdLogout size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}
