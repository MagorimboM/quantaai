import { useState} from 'react'
import type { RecipeItem} from "@/modules/landing/contracts/types"

const BRICK_WALL_RECIPE: RecipeItem[] = [
  { type: 'material', name: 'Clay Bricks (110mm)', qty: 60, unit: 'units/m²' },
  { type: 'material', name: 'Mortar Premix', qty: 0.015, unit: 'm³/m²' },
  { type: 'labour', name: 'Bricklayer', qty: 1.2, unit: 'hrs/m²' },
  { type: 'overhead', name: 'Scaffold Hire', qty: 0.1, unit: 'day/m²' },
]


// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-AU', { maximumFractionDigits: 0 })
  if (n < 0.1) return n.toFixed(3)
  if (n < 10) return n.toFixed(2)
  return n.toFixed(1)
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

export function HeroDemo() {
  const [area, setArea] = useState(40.8)
  const [key, setKey] = useState(0)

  return (
    <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '6px', overflow: 'hidden' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #27272A' }}>
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-display font-700 text-sm tracking-widest" style={{ color: '#FAFAFA' }}>
            110MM BRICK WALL
          </span>
          <span className="font-mono text-xs px-2 py-0.5" style={{ background: '#27272A', color: '#71717A' }}>
            RECIPE
          </span>
        </div>
        <p className="font-mono text-xs" style={{ color: '#52525B' }}>Masonry · per m²</p>
      </div>

      {/* Per-unit items */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #27272A' }}>
        <p className="font-mono text-xs mb-2" style={{ color: '#52525B' }}>PER 1 m²</p>
        {BRICK_WALL_RECIPE.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs w-7" style={{ color: typeColor(item.type) }}>
                {typeTag(item.type)}
              </span>
              <span className="text-sm" style={{ color: '#A1A1AA' }}>{item.name}</span>
            </div>
            <span className="font-mono text-xs" style={{ color: '#52525B' }}>
              {item.qty} {item.unit.split('/')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #27272A' }}>
        <p className="font-mono text-xs mb-2" style={{ color: '#52525B' }}>MEASUREMENT</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={area}
            onChange={e => {
              const n = parseFloat(e.target.value)
              if (!isNaN(n) && n >= 0) { setArea(n); setKey(k => k + 1) }
            }}
            className="font-mono text-2xl font-500 w-28 bg-transparent outline-none text-right border-b pb-1"
            style={{ color: '#FAFAFA', borderColor: '#3F3F46' }}
            min="0" step="0.1"
          />
          <span className="font-display font-600 text-lg" style={{ color: '#71717A' }}>m²</span>
        </div>
      </div>

      {/* Output */}
      <div className="px-5 py-4">
        <p className="font-mono text-xs mb-3" style={{ color: '#71717A' }}>QUANTITIES</p>
        {BRICK_WALL_RECIPE.map((item, i) => (
          <div key={`${key}-${i}`} className="flex items-center justify-between py-1 count-animate">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs w-7" style={{ color: typeColor(item.type) }}>
                {typeTag(item.type)}
              </span>
              <span className="text-sm" style={{ color: '#A1A1AA' }}>{item.name}</span>
            </div>
            <span className="font-mono font-500 text-sm" style={{ color: '#FAFAFA' }}>
              {fmt(item.qty * area)}{' '}
              <span style={{ color: '#52525B', fontSize: '11px' }}>{item.unit.split('/')[0]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-14">
      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24">
        <div>
          <div
            className="inline-flex items-center gap-2 text-xs font-mono mb-8 px-3 py-1.5 rounded"
            style={{ border: '1px solid #27272A', color: '#71717A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
            QUANTITY TAKEOFF SOFTWARE
          </div>

          <h1
            className="font-display font-900 leading-none mb-6"
            style={{ fontSize: 'clamp(48px, 6.5vw, 80px)', color: '#FAFAFA', letterSpacing: '-0.01em' }}
          >
            MEASURE ONCE.
            <br />
            QUANTA
            <br />
            CALCULATES
            <br />
            EVERYTHING ELSE.
          </h1>

          <p className="text-base mb-8 max-w-md leading-relaxed" style={{ color: '#71717A' }}>
            Build a recipe for each type of work. Enter one measurement on site. Get every material quantity, labour hour, and overhead worked out automatically.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-display font-700 text-sm tracking-widest transition-all duration-150 hover:bg-zinc-100 rounded"
              style={{ background: '#FAFAFA', color: '#09090B' }}
            >
              REQUEST ACCESS <ArrowRightIcon />
            </a>
            <a
              href="#how-it-works"
              className="text-sm transition-colors hover:text-white"
              style={{ color: '#52525B' }}
            >
              See how it works →
            </a>
          </div>

          <div className="flex items-center gap-10 mt-12 pt-8" style={{ borderTop: '1px solid #27272A' }}>
            {[
              { val: '40+', label: 'Recipe types' },
              { val: '6', label: 'Trade categories' },
              { val: '100%', label: 'Private data' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-800 text-xl" style={{ color: '#FAFAFA' }}>{s.val}</div>
                <div className="text-xs" style={{ color: '#52525B' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <HeroDemo />
        </div>
      </div>
    </section>
  )
}