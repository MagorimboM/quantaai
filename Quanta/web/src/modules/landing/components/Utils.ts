import type { RecipeItem } from '@/modules/landing/contracts/types'

export function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-AU', { maximumFractionDigits: 0 })
  if (n < 0.1) return n.toFixed(3)
  if (n < 10) return n.toFixed(2)
  return n.toFixed(1)
}

export function typeTag(type: RecipeItem['type']): string {
  if (type === 'material') return 'MAT'
  if (type === 'labour') return 'LAB'
  return 'OVH'
}

export function typeColor(type: RecipeItem['type']): string {
  if (type === 'material') return '#2B1B0E'
  if (type === 'labour') return '#6B4F2E'
  return '#9C7B4F'
}