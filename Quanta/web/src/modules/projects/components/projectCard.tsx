import { MdOutlineArrowRightAlt } from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi2";

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
  projectId?: string;
  companyId?: string | null;
  numberOfLineItems: number;
  time: Date;
}) {
  function navigateToProjectBillOfQuants() {
    // on click navigate to project bill of Quants
  }

  function timeAgo() {
    // current time

    const currentTime = new Date()
    const lastUpdatedTime = time

    console.log(
      `currentMilliseconds: ${currentTime.getMilliseconds.toString()}, lastUpdatedMilliseconds : ${lastUpdatedTime.getMilliseconds.toString}`,
    );
  }


  return (
    <div
      onClick={() => navigateToProjectBillOfQuants()}
      className="flex flex-1 flex-row justify-between rounded-lg border bg-muted/40 cursor-pointer transition-colors hover:bg-muted"
    >
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h1 className="text-sm font-medium text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{type}</p>
        <div className="flex flex-row flex-1 justify-between">
          <p className="flex flex-row items-center gap-1.5 text-xs text-muted-foreground">
            <HiOutlineClock size={14} /> {"time place holder"} ago
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
