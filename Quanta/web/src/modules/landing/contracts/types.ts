export interface RecipeItem {
  type: 'material' | 'labour' | 'overhead'
  name: string
  qty: number
  unit: string
}

export interface SiteVariant {
  label: string
  tag: string
  items: RecipeItem[]
  extra?: string[]
}