import { useState, useEffect } from "react";
import { LuBuilding2 } from "react-icons/lu";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { MdMenuBook } from "react-icons/md";
import { GrProjects } from "react-icons/gr";

// TODO :: implement navigate to workspace route

export function CompanyWorkSpaceCard({
  id,
  companyId,
  companyName,
  numberOfProjects,
  numberOfRecipes,
  lastActivity,
}: {
  id: string;
  companyId:string
  companyName: string;
  numberOfProjects: number;
  numberOfRecipes: number;
  lastActivity: string;
}) {
  function goToWorkSpace() {
    localStorage.setItem("workspaceId", id);
    localStorage.setItem("companyId", companyId)
    navigation.navigate('/dashboard'); 
  }
  return (
    <>
      <div className="flex flex-col gap-4 w-full border rounded-lg p-4 bg-card text-card-foreground">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-lg font-medium text-foreground">{companyName}</h1>
          <LuBuilding2 size={22} className="text-muted-foreground" />
        </div>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row items-center justify-between w-full cursor-pointer">
            <div className="flex flex-row items-center gap-2">
              <MdMenuBook size={20} className="text-muted-foreground" />
              <div className="flex flex-col items-start gap-0.5">
                <h1 className="text-sm font-semibold text-foreground">
                  {numberOfRecipes}
                </h1>
                <p className="text-xs text-muted-foreground">Recipes</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <GrProjects size={20} className="text-muted-foreground" />
              <div className="flex flex-col items-start gap-0.5">
                <h1 className="text-sm font-semibold text-foreground">
                  {numberOfProjects}
                </h1>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <MdOutlineCalendarMonth
                size={20}
                className="text-muted-foreground"
              />
              <div className="flex flex-col items-start gap-0.5">
                <h1 className="text-sm font-semibold text-foreground">
                  {lastActivity}
                </h1>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => goToWorkSpace()}
          className="w-full rounded-md p-2 text-sm font-medium border-2 border-primary text-primary transition-all duration-300 ease-in-out hover:bg-primary hover:text-primary-foreground active:scale-95 cursor-pointer"
        >
          Enter Workspace
        </button>
      </div>
    </>
  );
}
