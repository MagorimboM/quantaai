// The last step of adding a line: how much of it (required), where it is, and
// any notes. "Location" is stored in the line item's `description` column.
// Submitting is only possible once there is a measurement above zero, because
// a line with no measurement would total nothing.
export function AddToTakeoffForm({
  unit,
  measurement,
  location,
  notes,
  summary,
  canAdd,
  errorMessage,
  onMeasurementChange,
  onLocationChange,
  onNotesChange,
  onCancel,
  onAdd,
}: {
  unit: string;
  measurement: string;
  location: string;
  notes: string;
  summary: string;
  canAdd: boolean;
  errorMessage: string | null;
  onMeasurementChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onCancel: () => void;
  onAdd: () => void;
}) {
  const inputClass =
    "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";
  const labelClass = "text-xs font-medium text-foreground";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canAdd) onAdd();
      }}
      className="flex flex-col gap-3 border-t bg-card px-5 py-4"
    >
      <div className="flex items-end gap-3">
        <div className="flex w-40 shrink-0 flex-col gap-1">
          <label htmlFor="takeoff-measurement" className={labelClass}>
            Measurement<span className="ml-0.5 text-destructive">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="takeoff-measurement"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={measurement}
              onChange={(e) => onMeasurementChange(e.target.value)}
              className={`${inputClass} text-right tabular-nums`}
            />
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="takeoff-location" className={labelClass}>
            Location
          </label>
          <input
            id="takeoff-location"
            type="text"
            placeholder="e.g. North elevation"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="takeoff-notes" className={labelClass}>
            Notes
          </label>
          <input
            id="takeoff-notes"
            type="text"
            placeholder="e.g. Window openings deducted"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{summary}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 cursor-pointer rounded-md border px-4 text-sm font-medium text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canAdd}
            className="h-9 cursor-pointer rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to takeoff
          </button>
        </div>
      </div>
    </form>
  );
}