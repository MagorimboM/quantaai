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
    <div className="flex items-center gap-3 rounded-xl border border-[#F0EDE8] bg-[#FAFAF9] px-3 py-2 transition-colors hover:border-[#FFD9C9] focus-within:border-[#FF6B35] focus-within:bg-white focus-within:ring-[3px] focus-within:ring-[#FFF4EE]">
      <input
        className="flex-1 bg-transparent text-sm text-[#1C1917] outline-none placeholder:text-[#A8A29E]"
        type="text"
        placeholder="Search projects by name or description..."
        value={searchTerm}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitSearch();
        }}
      />

      <button
        title="submit-search-term"
        onClick={submitSearch}
        className="flex cursor-pointer flex-row rounded-lg p-1 text-[#A8A29E] transition-colors hover:bg-[#FFF4EE] hover:text-[#FF6B35]"
      >
        <MdOutlineSearch size={20} />
      </button>
    </div>
  );
}