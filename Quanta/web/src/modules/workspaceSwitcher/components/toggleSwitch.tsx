export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex cursor-pointer items-center gap-[9px] text-xs text-[#78716C] transition-colors duration-150 hover:text-[#57534E]"
    >
      <div
        className={`relative h-[18px] w-[30px] rounded-full border transition-colors duration-200 ${
          checked ? "border-[#FF6B35] bg-[#FF6B35]" : "border-[#DEDAD4] bg-[#F5F5F4]"
        }`}
      >
        <div
          className={`absolute top-[2px] h-3 w-3 rounded-full border bg-white transition-all duration-200 ${
            checked ? "left-[14px] border-white" : "left-[2px] border-[#D6D3D1]"
          }`}
        />
      </div>
      {label}
    </button>
  );
}