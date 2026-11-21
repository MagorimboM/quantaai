import { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";

// Search box for the projects list. A search runs when the user presses Enter
// or clicks the button, not on every keystroke, so each search is one deliberate
// request. Clearing the box shows the full list again straight away.
export function SearchBarComp({
  onSearch,
}: {
  onSearch: (term: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  function handleChange(value: string) {
    setSearchTerm(value);
    if (value === "" && searchTerm !== "") onSearch("");
  }

  function submitSearch() {
    onSearch(searchTerm.trim());
  }

  return (
    <div className="flex h-[54px] items-center gap-3 rounded-xl border border-[#E9E4DE] bg-white px-4 shadow-[0_8px_26px_rgba(67,50,38,0.04)] transition-all hover:border-[#FFC2B1] focus-within:border-[#FFB39E] focus-within:shadow-[0_0_0_4px_rgba(255,107,74,0.08),0_10px_28px_rgba(67,50,38,0.05)]">
      <MdOutlineSearch size={20} className="shrink-0 text-[#99918A]" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm text-[#292524] outline-none placeholder:text-[#9E9690]"
        type="text"
        aria-label="Search projects"
        placeholder="Search projects by name or description..."
        value={searchTerm}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitSearch();
        }}
      />

      <button
        type="button"
        title="submit-search-term"
        onClick={submitSearch}
        className="cursor-pointer rounded-lg border border-[#EAE5DF] bg-[#FAF9F7] px-2.5 py-1 text-xs font-semibold text-[#A59D96] transition-colors hover:border-[#FFC6B5] hover:text-[#FF6B4A]"
      >
        Search
      </button>
    </div>
  );
}