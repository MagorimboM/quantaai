import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";

// TODO:: Need the companyId, CategoryID from somewhere

export function SearchBar({
  onSearch,
}: {
  onSearch: (term: string) => void;
}) {
  const [userInput, setUserInput] = useState<string>("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearch(userInput);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userInput]);

  function saveUserInput(e: React.ChangeEvent<HTMLInputElement>) {
    setUserInput(e.target.value.trim());
  }

  return (
    <div className="relative">
      <FiSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        value={userInput}
        onChange={saveUserInput}
        type="text"
        placeholder="Search recipes..."
        className="
          w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3
          text-sm text-zinc-900 placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-zinc-900
        "
      />
    </div>
  );
}