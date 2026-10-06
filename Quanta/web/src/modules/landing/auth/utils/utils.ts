import type { RecipeItemType } from '@/modules/landing/auth/contracts/landing.response.contracts'

// Formats a calculated quantity so it reads sensibly at any size:
// 2,448 (no decimals), 49.0, 0.61, 0.015. Small amounts keep more decimals
// so they don't show as 0.
export function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-AU', { maximumFractionDigits: 0 })
  if (n < 0.1) return n.toFixed(3)
  if (n < 10) return n.toFixed(2)
  return n.toFixed(1)
}

// Three-letter label for the kind of recipe line: MAT, LAB or OVH
export function typeTag(type: RecipeItemType): string {
  if (type === 'material') return 'MAT'
  if (type === 'labour') return 'LAB'
  return 'OVH'
}

// Text colour for that label: materials darkest, overheads lightest
export function typeColor(type: RecipeItemType): string {
  if (type === 'material') return '#2B1B0E'
  if (type === 'labour') return '#6B4F2E'
  return '#9C7B4F'
}