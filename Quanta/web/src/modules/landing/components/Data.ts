import type { RecipeItem, SiteVariant } from '@/modules/landing/contracts/types'
import { BrickIcon, ConcreteIcon, RoofIcon, FramingIcon, EarthIcon, FinishIcon } from '@/modules/landing/components/Icons'

export const BRICK_WALL_RECIPE: RecipeItem[] = [
  { type: 'material', name: 'Clay Bricks (110mm)', qty: 60, unit: 'units/m²' },
  { type: 'material', name: 'Mortar Premix', qty: 0.015, unit: 'm³/m²' },
  { type: 'labour', name: 'Bricklayer', qty: 1.2, unit: 'hrs/m²' },
  { type: 'overhead', name: 'Scaffold Hire', qty: 0.1, unit: 'day/m²' },
]

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

export const CATEGORIES = [
  { name: 'Masonry', count: 14, icon: BrickIcon },
  { name: 'Concrete', count: 9, icon: ConcreteIcon },
  { name: 'Roofing', count: 11, icon: RoofIcon },
  { name: 'Framing', count: 8, icon: FramingIcon },
  { name: 'Earthworks', count: 6, icon: EarthIcon },
  { name: 'Finishes', count: 12, icon: FinishIcon },
]