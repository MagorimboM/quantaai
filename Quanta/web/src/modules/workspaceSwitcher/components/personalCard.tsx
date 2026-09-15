import { MdOutlinePersonOutline, MdOutlineCalendarMonth } from "react-icons/md";
import { MdMenuBook } from "react-icons/md";
import { GrProjects } from "react-icons/gr";
import { useState, useEffect } from "react";

export function PersonalWorkSpaceCard({
  numberOfProjects,
  lastActivity,
  numberOfRecipes,
}: {
  numberOfProjects: number;
  lastActivity: string;
  numberOfRecipes: number;
}) {
  return (
    <>
      <div className="w-full bg-primary/5 text-card-foreground rounded-lg p-6 border-2 border-primary/30 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-primary/10">
        <div className="flex flex-row w-full justify-center items-center">
          <MdOutlinePersonOutline
            className="rounded-lg p-2 bg-primary text-primary-foreground"
            size={50}
          />
          <div className="flex flex-col p-2 w-full">
            <h1 className="text-xl font-bold text-foreground">My Personal Workspace</h1>
            <p className="text-sm text-muted-foreground">your private workspace</p>
          </div>
        </div>
        {/* //todo::  map this part  */}
        <div className="flex flex-row items-center justify-between w-full cursor-pointer mt-4">
          <div className="flex flex-row items-center gap-2">
            <MdMenuBook size={24} className="text-muted-foreground" />
            <div className="flex flex-col items-start gap-0.5">
              <h1 className="text-sm font-semibold text-foreground">{numberOfRecipes}</h1>
              <p className="text-xs text-muted-foreground">Recipes</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <GrProjects size={24} className="text-muted-foreground" />
            <div className="flex flex-col items-start gap-0.5">
              <h1 className="text-sm font-semibold text-foreground">{numberOfProjects}</h1>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <MdOutlineCalendarMonth size={24} className="text-muted-foreground" />
            <div className="flex flex-col items-start gap-0.5">
              <h1 className="text-sm font-semibold text-foreground">{lastActivity}</h1>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}