import type { CSSProperties } from "react";

// Shared look for the takeoff workspace. Put this next to the other takeoff
// components: "@/modules/quantityTakeoff/components/takeoff.styles"

// A white bento card: 16px radius, warm hairline border, soft warm shadow
export const panelCard =
  "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#EFECE6] bg-white shadow-[0_10px_32px_rgba(67,50,38,0.055)]";

export const kicker =
  "text-[10px] font-bold uppercase tracking-[0.12em] leading-none text-[#A19A93]";

// Amber -> rose gradient hairline around a white field (the "AI glow")
export const glowBorder: CSSProperties = {
  border: "1px solid transparent",
  background:
    "linear-gradient(#FFFFFF,#FFFFFF) padding-box, linear-gradient(110deg, rgba(245,158,11,0.45), rgba(236,72,153,0.35)) border-box",
};

// The same glow around the warm cream hero card
export const heroGlowBorder: CSSProperties = {
  border: "1px solid transparent",
  background:
    "linear-gradient(#FFFBF5,#FFFBF5) padding-box, linear-gradient(110deg, rgba(245,158,11,0.5), rgba(236,72,153,0.35)) border-box",
};

// Mint "calculated" badge
export const calculatedBadge =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[#D5F2E3] bg-[#ECFDF5] px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[#059669]";

export const fieldClass =
  "h-9 w-full rounded-lg border border-[#E7E2DC] bg-white px-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-colors hover:border-[#FFD1C4] focus:border-[#FF9A81] focus:ring-[3px] focus:ring-[#FF6B4A]/10";