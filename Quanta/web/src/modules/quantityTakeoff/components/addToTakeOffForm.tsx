import { MdAdd, MdAutoAwesome, MdCheck } from "react-icons/md";
import {
  fieldClass,
  heroGlowBorder,
} from "@/modules/quantityTakeoff/components/takeoff.styles";

// The fields for the line being added: how much of it (required), where it is,
// and any notes. "Location" is stored in the line item's `description` column.
// This is only the fields; the <form> and the Add button (AddToTakeoffBar) are
// in the workspace, so the button can stay pinned while this scrolls.
export function AddToTakeoffForm({
  unit,
  measurement,
  location,
  notes,
  errorMessage,
  onMeasurementChange,
  onLocationChange,
  onNotesChange,
}: {
  unit: string;
  measurement: string;
  location: string;
  notes: string;
  errorMessage: string | null;
  onMeasurementChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  const parsed = parseFloat(measurement);
  const isLive = !Number.isNaN(parsed) && parsed > 0;
  const labelClass = "text-xs font-medium text-[#78716C]";

  return (
    <div
      style={heroGlowBorder}
      className="rounded-2xl p-4 shadow-[0_0_0_4px_rgba(244,145,86,0.055),0_9px_25px_rgba(165,96,57,0.08)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A25639]">
          <MdAutoAwesome size={13} />
          Measurement
        </span>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#16805B]">
            <i className="size-1.5 rounded-full bg-[#22A773] shadow-[0_0_0_3px_#DAF5E9]" />
            Live
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="takeoff-measurement" className={labelClass}>
          How much of this recipe?
          <span className="ml-0.5 text-red-600">*</span>
        </label>
        <div className="flex items-baseline gap-2">
          <input
            id="takeoff-measurement"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={measurement}
            onChange={(e) => onMeasurementChange(e.target.value)}
            className="w-40 bg-transparent text-[28px] font-semibold tracking-tight tabular-nums text-[#1C1917] outline-none placeholder:text-[#D6D0C9]"
          />
          <span className="text-sm font-semibold text-[#716964]">{unit}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="takeoff-location" className={labelClass}>
            Location
          </label>
          <input
            id="takeoff-location"
            type="text"
            placeholder="e.g. North elevation"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="takeoff-notes" className={labelClass}>
            Notes
          </label>
          <input
            id="takeoff-notes"
            type="text"
            placeholder="e.g. Openings deducted"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}

// The pinned bar under the calculator. It is a submit button, so it must sit
// inside the workspace's <form>. Submitting is only possible once there is a
// measurement above zero, because a line with no measurement totals nothing.
export function AddToTakeoffBar({
  summary,
  canAdd,
  justAdded,
}: {
  summary: string;
  canAdd: boolean;
  justAdded: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E6E0D9]/80 bg-white/85 px-6 py-4 shadow-[0_-14px_30px_rgba(72,52,39,0.055)] backdrop-blur">
      <p className="text-xs text-[#78716C]">{summary}</p>
      <button
        type="submit"
        disabled={!canAdd}
        className={`flex h-11 min-w-48 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all hover:-translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 ${
          justAdded
            ? "bg-[#13956B] shadow-[0_9px_22px_rgba(19,149,107,0.22)]"
            : "bg-[#FF6B4A] shadow-[0_9px_22px_rgba(255,107,74,0.26)] hover:bg-[#F25C3C]"
        }`}
      >
        {justAdded ? <MdCheck size={18} /> : <MdAdd size={18} />}
        {justAdded ? "Added to line items" : "Add to line items"}
      </button>
    </div>
  );
}