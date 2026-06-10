import {
  MdOutlineDashboard,
  MdOutlinePages,
  MdMenuBook,
  MdOutlineSettings,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
} from "react-icons/md";

import { NavLink } from "react-router";
import { useState } from "react";

export function SideBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropDownListModal, setDropDownListModal] = useState(false);

  const dropDownList = [
    {
      nameOfCompany: "Acme Inc",
      numberOfProjects: 12,
    },
    {
      nameOfCompany: "Quanta Labs",
      numberOfProjects: 7,
    },
  ];

  const sideBarList = [
    { name: "Dashboard", icon: <MdOutlineDashboard size={22} />, url: "/dashboard" },
    { name: "Projects", icon: <MdOutlinePages size={22} />, url: "/projects" },
    { name: "Recipes", icon: <MdMenuBook size={22} />, url: "/recipes" },
    { name: "Settings", icon: <MdOutlineSettings size={22} />, url: "/settings" },
  ];

  function toggleDropdown() {
    setDropDownListModal((prev) => !prev);
  }

  function toggleSidebar() {
    setIsCollapsed((prev) => !prev);
  }

  return (
    <aside
      className={`
        h-screen
        border-r
        bg-white
        transition-all
        duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        {!isCollapsed && (
          <div className="font-semibold text-lg">
            Quanta
          </div>
        )}

        <button
          onClick={()=>(toggleSidebar())}
          className="rounded-md p-2 hover:bg-zinc-100"
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
          onClick={()=>(toggleDropdown())}
          className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-zinc-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">
            Q
          </div>

          {!isCollapsed && (
            <div className="text-left">
              <div className="font-medium">
                Quanta
              </div>
              <div className="text-xs text-zinc-500">
                Main Workspace
              </div>
            </div>
          )}
        </button>

        {dropDownListModal && !isCollapsed && (
          <div className="absolute mt-2 w-full rounded-md border bg-white p-2 shadow-md">
            {dropDownList.map((option, key) => (
              <div
                key={key}
                className="cursor-pointer rounded-md p-2 hover:bg-zinc-100"
              >
                <div className="font-medium">
                  {option.nameOfCompany}
                </div>
                <div className="text-xs text-zinc-500">
                  {option.numberOfProjects} projects
                </div>
              </div>
            ))}

            <div className="mt-2 border-t pt-2">
              <button className="w-full rounded-md p-2 text-left hover:bg-zinc-100">
                View all workspaces
              </button>

              <button className="w-full rounded-md p-2 text-left hover:bg-zinc-100">
                Create workspace
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
                    ? "bg-zinc-900 text-white"
                    : "hover:bg-zinc-100"
                }
              `
            }
          >
            {option.icon}

            {!isCollapsed && (
              <span>{option.name}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}