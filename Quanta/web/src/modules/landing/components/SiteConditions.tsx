import { useState} from 'react'
import type { RecipeItem, SiteVariant} from "@/modules/landing/contracts/types"


const SITE_VARIANTS: SiteVariant[] = [
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

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}


function typeTag(type: RecipeItem['type']): string {
  if (type === 'material') return 'MAT'
  if (type === 'labour') return 'LAB'
  return 'OVH'
}

function typeColor(type: RecipeItem['type']): string {
  if (type === 'material') return '#FAFAFA'
  if (type === 'labour') return '#A1A1AA'
  return '#71717A'
}


export function SiteConditions() {
  const [active, setActive] = useState(0)

  return (
    <section id="site-conditions" className="py-24 max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky lg:top-24">
          <p className="font-mono text-xs mb-4" style={{ color: '#52525B' }}>SITE CONDITIONS</p>
          <h2
            className="font-display font-800 leading-none mb-6"
            style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', color: '#FAFAFA', letterSpacing: '-0.01em' }}
          >
            SAME SLAB.
            <br />
            DIFFERENT GROUND.
            <br />
            DIFFERENT RECIPE.
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#71717A' }}>
            A slab on muddy ground needs geotextile matting, a deeper sub-base, and more concrete. A slab on firm ground doesn't. Quanta lets you keep purpose-built variants of the same recipe — firm ground, soft ground, coastal, fill — and pick the right one when it matters.
          </p>

          <div className="flex flex-col gap-2 mt-8">
            {SITE_VARIANTS.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setActive(i)}
                className="flex items-center gap-3 px-4 py-3 text-left rounded transition-all duration-150"
                style={{
                  background: active === i ? '#18181B' : 'transparent',
                  border: `1px solid ${active === i ? '#3F3F46' : '#27272A'}`,
                  color: active === i ? '#FAFAFA' : '#71717A',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active === i ? '#FAFAFA' : '#3F3F46' }} />
                <div>
                  <div className="font-display font-600 text-sm tracking-wide">{v.label.toUpperCase()}</div>
                  <div className="font-mono text-xs" style={{ color: active === i ? '#71717A' : '#3F3F46' }}>{v.tag}</div>
                </div>
                {active === i && <ArrowRightIcon />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '6px', overflow: 'hidden' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid #27272A' }}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-display font-700 text-sm tracking-widest" style={{ color: '#FAFAFA' }}>
                CONCRETE SLAB · {SITE_VARIANTS[active].label.toUpperCase()}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: '#27272A', color: '#71717A' }}>
                {SITE_VARIANTS[active].tag.toUpperCase()}
              </span>
            </div>
            <p className="font-mono text-xs" style={{ color: '#52525B' }}>Concrete · per m² of slab</p>
          </div>

          <div className="px-6 py-4">
            <p className="font-mono text-xs mb-3" style={{ color: '#52525B' }}>PER 1 m²</p>
            {SITE_VARIANTS[active].items.map((item:any, i:number) => {
              const isExtra = SITE_VARIANTS[active].extra?.includes(item.name)
              return (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1C1C1F' }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs w-7" style={{ color: typeColor(item.type) }}>
                      {typeTag(item.type)}
                    </span>
                    <span className="text-sm" style={{ color: isExtra ? '#FAFAFA' : '#A1A1AA' }}>
                      {item.name}
                    </span>
                    {isExtra && (
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: '#27272A', color: '#71717A', fontSize: '10px' }}>
                        SITE-SPECIFIC
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs" style={{ color: '#52525B' }}>
                    {item.qty} {item.unit.split('/')[0]}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="px-6 py-4" style={{ background: '#131316', borderTop: '1px solid #27272A' }}>
            <p className="font-mono text-xs" style={{ color: '#52525B' }}>
              {SITE_VARIANTS[active].items.length} line items · Concrete category
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
