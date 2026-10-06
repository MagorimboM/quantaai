import type { ComponentType } from 'react'

// The static content the landing page displays (it comes from Data.ts). The
// landing page makes no API calls, so these are the shapes of what it shows.

// The three kinds of component a recipe is built from. Same split as the app:
// what to buy, who does the work, and the running costs around it.
export type RecipeItemType = 'material' | 'labour' | 'overhead'

// One line of a recipe. `unit` is written "total unit/measurement unit",
// for example 'm³/m²' (cubic metres per square metre of wall).
export interface RecipeItem {
  type: RecipeItemType
  name: string
  qty: number
  unit: string
}

// A recipe's identity without its lines.
export interface RecipeSummary {
  name: string
  category: string
  unit: string
}

export interface DemoRecipe extends RecipeSummary {
  items: RecipeItem[]
}

// The same recipe adjusted for a ground condition.
// `extra` names the lines that only exist because of that condition.
export interface SiteVariant {
  label: string
  tag: string
  items: RecipeItem[]
  extra?: string[]
}

export interface TradeCategory {
  name: string
  count: number
  icon: ComponentType
}

export interface HeroStat {
  value: string
  label: string
}