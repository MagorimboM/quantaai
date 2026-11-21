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
        border-[#F0EDE8]
        bg-white
        text-[#1C1917]
        transition-all
        duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EDE8] p-3">
        {!isCollapsed && (
          <div className="pl-2 text-lg font-semibold tracking-tight">
            Quanta
          </div>
        )}

        <button
          onClick={() => toggleSidebar()}
          className="rounded-lg p-2 text-[#A8A29E] transition-colors hover:bg-[#FFF4EE] hover:text-[#FF6B35] cursor-pointer"
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
          className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#FFF4EE] cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35] font-semibold text-white">
            Q
          </div>

          {!isCollapsed && (
            <div className="text-left">
              <div className="text-sm font-medium text-[#1C1917]">Quanta</div>
              <div className="text-xs text-[#78716C]">
                Main Workspace
              </div>
            </div>
          )}
        </button>
        {dropDownListModal && !isCollapsed && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-[#F0EDE8] bg-white p-2 shadow-lg">
            <button
              onClick={() => {
                gotToWorkSpaces();
              }}
              className="w-full rounded-lg p-2 text-left text-sm text-[#1C1917] transition-colors hover:bg-[#FFF4EE] hover:text-[#FF6B35] cursor-pointer"
            >
              View all workspaces
            </button>
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
                flex items-center gap-3 rounded-xl p-3 text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-[#FFF4EE] text-[#FF6B35]"
                    : "text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917]"
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