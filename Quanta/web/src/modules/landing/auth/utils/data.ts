import type {
  DemoRecipe,
  HeroStat,
  RecipeSummary,
  SiteVariant,
  TradeCategory,
} from '@/modules/landing/auth/contracts/landing.response.contracts'
import { BrickIcon, ConcreteIcon, RoofIcon, FramingIcon, EarthIcon, FinishIcon } from '@/modules/landing/components/Icons'

// ── Hero demo ────────────────────────────────────────────────────────────────
// The live calculator in the hero. It shows the core idea of the product:
// a recipe (per 1 m²) multiplied by ONE measurement gives every quantity.

// Default measurement, and the figure the "How it works" section also uses
export const DEMO_MEASUREMENT = 40.8

export const DEMO_RECIPE: DemoRecipe = {
  name: '110mm Brick Wall',
  category: 'Masonry',
  unit: 'm²',
  items: [
    { type: 'material', name: 'Clay Bricks (110mm)', qty: 60, unit: 'units/m²' },
    { type: 'material', name: 'Mortar Premix', qty: 0.015, unit: 'm³/m²' },
    { type: 'labour', name: 'Bricklayer', qty: 1.2, unit: 'hrs/m²' },
    { type: 'overhead', name: 'Scaffold Hire', qty: 0.1, unit: 'day/m²' },
  ],
}

// ── Site conditions section ──────────────────────────────────────────────────
// Same recipe, different ground, different lines. A slab on muddy ground needs
// extra matting and sub-base that a slab on firm ground doesn't, so users keep
// a variant of the recipe per condition and pick the right one for the job.

export const SITE_RECIPE: RecipeSummary = {
  name: 'Concrete Slab',
  category: 'Concrete',
  unit: 'm²',
}

export const SITE_VARIANTS: SiteVariant[] = [
  {
    label: 'Firm Ground',
    tag: 'Standard',
    items: [
      { type: 'material', name: 'Reinforced Concrete', qty: 0.15, unit: 'm³/m²' },
      { type: 'material', name: 'SL82 Mesh', qty: 1.0, unit: 'm²/m²' },
      { type: 'material', name: 'Edge Formwork', qty: 0.18, unit: 'lm/m²' },
      { type: 'labour', name: 'Concretor', qty: 0.4, unit: 'hrs/m²' },
      { type: 'overhead', name: 'Concrete Pump', qty: 0.02, unit: 'day/m²' },
    ],
  },
  {
    label: 'Soft / Muddy Ground',
    tag: 'Site-specific',
    items: [
      { type: 'material', name: 'Reinforced Concrete', qty: 0.20, unit: 'm³/m²' },
      { type: 'material', name: 'SL82 Mesh', qty: 1.0, unit: 'm²/m²' },
      { type: 'material', name: 'Edge Formwork', qty: 0.18, unit: 'lm/m²' },
      { type: 'material', name: 'Geotextile Matting', qty: 1.1, unit: 'm²/m²' },
      { type: 'material', name: 'Compacted Gravel Sub-base', qty: 0.12, unit: 'm³/m²' },
      { type: 'labour', name: 'Concretor', qty: 0.55, unit: 'hrs/m²' },
      { type: 'overhead', name: 'Concrete Pump', qty: 0.02, unit: 'day/m²' },
    ],
    extra: ['Geotextile Matting', 'Compacted Gravel Sub-base'],
  },
]

// ── Trade categories section ─────────────────────────────────────────────────
// TODO :: [content] These counts are illustrative, not real. A new account
// starts with no recipes, so "14 recipes" under Masonry describes example
// content. Either label them as examples or drop the counts before launch.
export const CATEGORIES: TradeCategory[] = [
  { name: 'Masonry', count: 14, icon: BrickIcon },
  { name: 'Concrete', count: 9, icon: ConcreteIcon },
  { name: 'Roofing', count: 11, icon: RoofIcon },
  { name: 'Framing', count: 8, icon: FramingIcon },
  { name: 'Earthworks', count: 6, icon: EarthIcon },
  { name: 'Finishes', count: 12, icon: FinishIcon },
]

// ── Hero stats ───────────────────────────────────────────────────────────────
// TODO :: [content] "40+ recipe types" doesn't match the category counts above
// (they add up to 60) and isn't backed by anything the product ships. Confirm
// the claim, or replace it with something that is true.
export const HERO_STATS: HeroStat[] = [
  { value: '40+', label: 'Recipe types' },
  { value: String(CATEGORIES.length), label: 'Trade categories' },
  { value: '100%', label: 'Private data' },
]