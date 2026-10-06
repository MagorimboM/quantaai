import { MdOutlineArrowRightAlt } from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi2";
import { useNavigate } from "react-router";
import { setActiveProject } from "@/common/storage/activeScope";
import { timeAgo } from "@/common/utils/timeAgo";

// Stored values look like "in_progress" or "single_storey"; shown with spaces,
// and the `capitalize` class gives them a capital letter.
function humanise(value: string): string {
  return value.replace(/_/g, " ");
}

// One project, as shown on the dashboard and on the projects list. Clicking it
// opens that project's takeoff. `numberOfLineItems` is optional because the
// dashboard doesn't load it; when it is given, the card shows how big the takeoff is.
export function ProjectCard({
  project,
}: {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    updatedAt: string;
    numberOfLineItems?: number;
  };
}) {
  const navigate = useNavigate();

  function openProjectTakeoff() {
    // The company is already the active one (both lists are scoped to it);
    // only the project needs to be recorded before opening the takeoff.
    setActiveProject(project.id);
    navigate("/projects/bill-of-quants");
  }

  return (
    <button
      onClick={openProjectTakeoff}
      className="flex w-full flex-row justify-between rounded-lg border bg-muted/40 text-left cursor-pointer transition-colors hover:bg-muted"
    >
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h1 className="text-sm font-medium text-foreground">{project.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {humanise(project.type)}
        </p>
        <div className="flex flex-row items-center justify-between gap-4">
          <p className="flex flex-row items-center gap-1.5 text-xs text-muted-foreground">
            <HiOutlineClock size={14} /> Updated {timeAgo(project.updatedAt)}
          </p>
          {project.numberOfLineItems !== undefined ? (
            <p className="text-xs text-muted-foreground">
              {project.numberOfLineItems} item
              {project.numberOfLineItems === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between p-4">
        <span className="inline-flex items-center rounded-full border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
          {humanise(project.status)}
        </span>

        <MdOutlineArrowRightAlt className="text-muted-foreground" size={20} />
      </div>
    </button>
  );
}