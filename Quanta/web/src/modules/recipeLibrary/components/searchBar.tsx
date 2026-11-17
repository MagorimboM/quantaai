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
    <div className="relative">
      <FiSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]"
      />
      <input
        value={userInput}
        onChange={(e) => handleChange(e.target.value)}
        type="text"
        placeholder="Search recipes..."
        className="w-full rounded-lg border border-[#F0EDE8] bg-[#FAFAF9] py-2 pl-9 pr-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-colors hover:border-[#FFD9C9] focus:border-[#FF6B35] focus:bg-white focus:ring-[3px] focus:ring-[#FFF4EE]"
      />
    </div>
  );
}