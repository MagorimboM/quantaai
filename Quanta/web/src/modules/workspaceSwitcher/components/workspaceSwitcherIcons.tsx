export function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.25" stroke="#B89B6E" strokeWidth="1.25" />
      <path d="M9.5 9.5L12 12" stroke="#B89B6E" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRight({ color = '#B89B6E' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4.5 10.5L8.5 6.5L4.5 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1V12M1 6.5H12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}