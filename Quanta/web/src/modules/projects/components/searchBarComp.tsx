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
    <div className="flex items-center gap-4 rounded-lg bg-muted p-2 focus-within:outline-2 focus-within:outline-ring">
      <input
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
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
        className="cursor-pointer rounded-lg p-1 transition-colors hover:bg-accent flex flex-row"
      >
        <MdOutlineSearch size={20} />
      </button>
    </div>
  );
}