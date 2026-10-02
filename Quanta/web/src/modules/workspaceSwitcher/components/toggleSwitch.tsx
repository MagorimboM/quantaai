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
      className="flex items-center gap-2.5 text-xs text-[#B89B6E] hover:text-[#9C7B4F] transition-colors duration-150 cursor-pointer"
    >
      <div
        className={`relative w-8 h-4 rounded-full border transition-colors duration-200 ${
          checked ? "bg-[#9C7B4F] border-[#9C7B4F]" : "bg-transparent border-[#D4B896]"
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
            checked ? "left-4 bg-white" : "left-0.5 bg-[#B89B6E]"
          }`}
        />
      </div>
      {label}
    </button>
  );
}