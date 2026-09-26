import { useState, useEffect } from 'react'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(9,9,11,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #F3DEC0' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="font-display font-800 text-lg tracking-widest" style={{ color: '#2B1B0E' }}>
          QUANTA
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#9C7B4F' }}>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#site-conditions" className="hover:text-white transition-colors">Site conditions</a>
          <a href="#categories" className="hover:text-white transition-colors">Categories</a>
        </div>
        <a
          href="#cta"
          className="text-xs font-600 px-4 py-2 transition-all duration-150 hover:bg-zinc-100"
          style={{
            background: '#FF6B35',
            color: '#FFFFFF',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '0.08em',
          }}
        >
          REQUEST ACCESS
        </a>
      </div>
    </nav>
  )
}