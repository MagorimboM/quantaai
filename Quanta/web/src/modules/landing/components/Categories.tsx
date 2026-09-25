const CATEGORIES = [
  { name: 'Masonry', count: 14, icon: BrickIcon },
  { name: 'Concrete', count: 9, icon: ConcreteIcon },
  { name: 'Roofing', count: 11, icon: RoofIcon },
  { name: 'Framing', count: 8, icon: FramingIcon },
  { name: 'Earthworks', count: 6, icon: EarthIcon },
  { name: 'Finishes', count: 12, icon: FinishIcon },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

function BrickIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="9" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13" y="7" width="9" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="6" y="13" width="9" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="13" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="17" y="13" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
function ConcreteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M2 18L5 6H19L22 18H2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 18V12M12 18V10M16 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function RoofIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 4L21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10.5V20H19V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
function FramingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 9H21M3 15H21M9 3V21M15 3V21" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
function EarthIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 14C3 14 6 10 12 10C18 10 21 14 21 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 18H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 14V18M12 10V18M19 14V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function FinishIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13" y="3" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13" y="13" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

export function Categories() {
  return (
    <section id="categories" className="py-24" style={{ background: '#0C0C0E' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end mb-14">
          <div>
            <p className="font-mono text-xs mb-4" style={{ color: '#52525B' }}>ORGANISED BY TRADE</p>
            <h2
              className="font-display font-800 leading-none"
              style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: '#FAFAFA', letterSpacing: '-0.01em' }}
            >
              YOUR WHOLE
              <br />
              CATALOGUE,
              <br />
              IN ORDER.
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>
            Every recipe sits under a trade category. Materials, labour, and overheads are classified the same way across all of them. As your library grows, it stays organised and searchable — not a flat spreadsheet you dig through to find the right template.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ background: '#27272A' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <div
                key={cat.name}
                className="p-8 cursor-pointer transition-colors duration-150"
                style={{ background: '#0C0C0E' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#18181B')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0C0C0E')}
              >
                <div className="mb-4" style={{ color: '#71717A' }}>
                  <Icon />
                </div>
                <div className="font-display font-700 text-base tracking-wide mb-1" style={{ color: '#FAFAFA' }}>
                  {cat.name.toUpperCase()}
                </div>
                <div className="font-mono text-xs" style={{ color: '#52525B' }}>{cat.count} recipes</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
