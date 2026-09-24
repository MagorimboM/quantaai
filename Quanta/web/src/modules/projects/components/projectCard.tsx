import { MdOutlineArrowRightAlt } from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi2";
import { useNavigate } from "react-router";

export function ProjectCard({
  name,
  type,
  status,
  numberOfLineItems,
  time,
  companyId,
  projectId,
}: {
  name?: string;
  type?: string;
  status?: string;
  projectId: string;
  companyId: string | null;
  numberOfLineItems: number;
  time: Date;
}) {
  const navigate = useNavigate();

  function navigateToProjectBillOfQuants() {
    localStorage.setItem("projectId", projectId);
    if (companyId) {
      localStorage.setItem("companyId", companyId);
    }
    navigate("/projects/bill-of-quants");
  }

  function timeAgo(): string {
    const seconds = Math.floor((Date.now() - new Date(time).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div
      onClick={() => navigateToProjectBillOfQuants()}
      className="flex flex-row justify-between rounded-lg border bg-muted/40 cursor-pointer transition-colors hover:bg-muted"
    >
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h1 className="text-sm font-medium text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{type}</p>
        <div className="flex flex-row flex-1 justify-between">
          <p className="flex flex-row items-center gap-1.5 text-xs text-muted-foreground">
            <HiOutlineClock size={14} /> {timeAgo()} ago
          </p>
          <p>{numberOfLineItems} items</p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between p-4">
        <span className="inline-flex items-center rounded-full border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {status}
        </span>

        <MdOutlineArrowRightAlt
          className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          size={20}
        />
      </div>
    </div>
  );
}