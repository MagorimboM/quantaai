import { useState } from "react";
import type React from "react";
import { MdOutlineSearch } from "react-icons/md";
export function SearchBarComp() {
  const [searchTerm, setSearchTerm] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-lg bg-gray-200 p-2 focus-within:outline-2 focus-within:outline-zinc-400">
      <input
        className="flex-1 bg-transparent outline-none"
        type="text"
        placeholder="Search your quants..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        title="submit-search-term"
        className="cursor-pointer rounded-lg p-1 hover:bg-zinc-400 flex flex-row"
      >
        <MdOutlineSearch size={20} />
      </button>
    </div>
  );
}
