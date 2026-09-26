import { useState, useEffect } from 'react'
import { BRICK_WALL_RECIPE } from '@/modules/landing/components/Data'
import { fmt, typeTag, typeColor } from '@/modules/landing/components/Utils'
import { ArrowRightIcon } from '@/modules/landing/components/Icons'


function HeroDemo() {
  const [area, setArea] = useState(40.8)
  const [key, setKey] = useState(0)
  const [isAuto, setIsAuto] = useState(true)

  const DEMO_VALUES = [40.8, 65.2, 28.5, 52.0]

  useEffect(() => {
    if (!isAuto) return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % DEMO_VALUES.length
      setArea(DEMO_VALUES[i])
      setKey(k => k + 1)
    }, 2200)
    return () => clearInterval(interval)
  }, [isAuto])

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #F3DEC0', borderRadius: '6px', overflow: 'hidden' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3DEC0' }}>
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-display font-700 text-sm tracking-widest" style={{ color: '#2B1B0E' }}>
            110MM BRICK WALL
          </span>
          <div className="flex items-center gap-2">
            {isAuto && (
              <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: '#B89B6E' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#9C7B4F', animation: 'pulseDemo 1.8s ease-in-out infinite' }}
                />
                LIVE
              </span>
            )}
            <span className="font-mono text-xs px-2 py-0.5" style={{ background: '#F3DEC0', color: '#9C7B4F' }}>
              RECIPE
            </span>
          </div>
        </div>
        <p className="font-mono text-xs" style={{ color: '#B89B6E' }}>Masonry · per m²</p>
      </div>

      {/* Per-unit items */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #F3DEC0' }}>
        <p className="font-mono text-xs mb-2" style={{ color: '#B89B6E' }}>PER 1 m²</p>
        {BRICK_WALL_RECIPE.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs w-7" style={{ color: typeColor(item.type) }}>
                {typeTag(item.type)}
              </span>
              <span className="text-sm" style={{ color: '#6B4F2E' }}>{item.name}</span>
            </div>
            <span className="font-mono text-xs" style={{ color: '#B89B6E' }}>
              {item.qty} {item.unit.split('/')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3DEC0' }}>
        <p className="font-mono text-xs mb-2" style={{ color: '#B89B6E' }}>MEASUREMENT</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={area}
            onFocus={() => setIsAuto(false)}
            onChange={e => {
              setIsAuto(false)
              const n = parseFloat(e.target.value)
              if (!isNaN(n) && n >= 0) { setArea(n); setKey(k => k + 1) }
            }}
            className="font-mono text-2xl font-500 w-28 bg-transparent outline-none text-right border-b pb-1"
            style={{ color: '#2B1B0E', borderColor: '#F3DEC0' }}
            min="0" step="0.1"
          />
          <span className="font-display font-600 text-lg" style={{ color: '#9C7B4F' }}>m²</span>
        </div>
      </div>

      {/* Output */}
      <div className="px-5 py-4">
        <p className="font-mono text-xs mb-3" style={{ color: '#9C7B4F' }}>QUANTITIES</p>
        {BRICK_WALL_RECIPE.map((item, i) => (
          <div key={`${key}-${i}`} className="flex items-center justify-between py-1 count-animate">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs w-7" style={{ color: typeColor(item.type) }}>
                {typeTag(item.type)}
              </span>
              <span className="text-sm" style={{ color: '#6B4F2E' }}>{item.name}</span>
            </div>
            <span className="font-mono font-500 text-sm" style={{ color: '#2B1B0E' }}>
              {fmt(item.qty * area)}{' '}
              <span style={{ color: '#B89B6E', fontSize: '11px' }}>{item.unit.split('/')[0]}</span>
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
      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-24">
        <div>
          <div
            className="inline-flex items-center gap-2 text-xs font-mono mb-8 px-3 py-1.5 rounded"
            style={{ border: '1px solid #F3DEC0', color: '#9C7B4F' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
            QUANTITY TAKEOFF SOFTWARE
          </div>

          <h1
            className="font-display font-900 leading-none mb-6"
            style={{ fontSize: 'clamp(48px, 6.5vw, 80px)', color: '#2B1B0E', letterSpacing: '-0.01em' }}
          >
            MEASURE ONCE.
            <br />
            QUANTA
            <br />
            CALCULATES
            <br />
            EVERYTHING ELSE.
          </h1>

          <p className="text-base mb-8 max-w-md leading-relaxed" style={{ color: '#9C7B4F' }}>
            Build a recipe for each type of work. Enter one measurement on site. Get every material quantity, labour hour, and overhead worked out automatically.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-display font-700 text-sm tracking-widest transition-all duration-150 hover:bg-zinc-100 rounded"
              style={{ background: '#FF6B35', color: '#FFFFFF' }}
            >
              REQUEST ACCESS <ArrowRightIcon />
            </a>
            <a
              href="#how-it-works"
              className="text-sm transition-colors hover:text-white"
              style={{ color: '#B89B6E' }}
            >
              See how it works →
            </a>
          </div>

          <div className="flex items-center gap-10 mt-12 pt-8" style={{ borderTop: '1px solid #F3DEC0' }}>
            {[
              { val: '40+', label: 'Recipe types' },
              { val: '6', label: 'Trade categories' },
              { val: '100%', label: 'Private data' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-800 text-xl" style={{ color: '#2B1B0E' }}>{s.val}</div>
                <div className="text-xs" style={{ color: '#B89B6E' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
          <HeroDemo />
        </div>
      </div>
    </section>
  )
}