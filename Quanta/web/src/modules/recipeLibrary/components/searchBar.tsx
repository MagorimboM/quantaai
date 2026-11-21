import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";

const SEARCH_DELAY_MS = 400;

// Search box for the recipe list. The search runs shortly after the user stops
// typing, so it isn't one request per keystroke. What they type is passed on as
// typed (spaces included); only the ends are trimmed when it is sent.
export function SearchBar({
  onSearch,
}: {
  onSearch: (term: string) => void;
}) {
  const [userInput, setUserInput] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    setUserInput(value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(value.trim()), SEARCH_DELAY_MS);
  }

  // Don't fire a search after the box has left the screen
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <label className="flex h-11 items-center gap-3 rounded-xl border border-[#E7E3DC] bg-white px-4 shadow-[0_2px_10px_rgba(49,38,24,0.035)] transition focus-within:border-[#FF9A82] focus-within:ring-4 focus-within:ring-[#FF6B4A]/10">
      <FiSearch size={18} className="shrink-0 text-[#A8A29E]" />
      <input
        value={userInput}
        onChange={(e) => handleChange(e.target.value)}
        type="text"
        aria-label="Search recipes"
        placeholder="Search recipes by name or description..."
        className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#A8A29E]"
      />
    </label>
  );
}