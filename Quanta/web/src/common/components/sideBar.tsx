import {
  MdOutlineDashboard,
  MdOutlinePages,
  MdMenuBook,
  MdOutlineSettings,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
} from "react-icons/md";

import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
export function SideBarComp() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropDownListModal, setDropDownListModal] = useState(false);


  const sideBarList = [
    {
      name: "Dashboard",
      icon: <MdOutlineDashboard size={22} />,
      url: "/dashboard",
    },
    { name: "Projects", icon: <MdOutlinePages size={22} />, url: "/projects" },
    { name: "Recipes", icon: <MdMenuBook size={22} />, url: "/recipes" },
    {
      name: "Settings",
      icon: <MdOutlineSettings size={22} />,
      url: "/settings",
    },
  ];

  function toggleDropdown() {
    setDropDownListModal((prev) => !prev);
  }

  function toggleSidebar() {
    setIsCollapsed((prev) => !prev);
  }
  function gotToWorkSpaces() {
    localStorage.removeItem("workspaceId");
    localStorage.removeItem("companyId");
    localStorage.removeItem("projectId");
    navigate("/");
  }
  return (
    <aside
      className={`
        h-screen
        border-r
        border-sidebar-border
        bg-sidebar
        text-sidebar-foreground
        transition-all
        duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border p-3">
        {!isCollapsed && <div className="font-semibold text-lg">Quanta</div>}

        <button
          onClick={() => toggleSidebar()}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
        >
          {isCollapsed ? (
            <MdOutlineChevronRight size={20} />
          ) : (
            <MdOutlineChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Workspace Selector */}
      <div className="relative p-2">
        <button
          onClick={() => toggleDropdown()}
          className="flex w-full items-center gap-3 rounded-md p-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
            Q
          </div>

          {!isCollapsed && (
            <div className="text-left">
              <div className="font-medium">Quanta</div>
              <div className="text-xs text-muted-foreground">
                Main Workspace
              </div>
            </div>
          )}
        </button>
        {dropDownListModal && !isCollapsed && (
          <div className="absolute mt-2 w-full rounded-md border border-border bg-popover p-2 shadow-md z-10">
            <div className="mt-2 border-t border-border pt-2">
              <button
                onClick={() => {
                  gotToWorkSpaces();
                }}
                className="w-full rounded-md p-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                View all workspaces
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2">
        {sideBarList.map((option) => (
          <NavLink
            key={option.url}
            to={option.url}
            className={({ isActive }) =>
              `
                flex items-center gap-3 rounded-md p-3
                transition-colors
                ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
              `
            }
          >
            {option.icon}

            {!isCollapsed && <span>{option.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
