import { useState} from 'react'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function CTASection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section id="cta" className="py-32" style={{ background: '#FAFAFA' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2
          className="font-display font-900 leading-none mb-6"
          style={{ fontSize: 'clamp(44px, 6vw, 80px)', color: '#09090B', letterSpacing: '-0.02em' }}
        >
          STOP DOING
          <br />
          THE MATHS
          <br />
          TWICE.
        </h2>
        <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: '#71717A' }}>
          Quanta is in early access. Request a spot and we'll be in touch when your account is ready.
        </p>

        {!submitted ? (
          <form
            onSubmit={e => { e.preventDefault(); if (email.trim()) setSubmitted(true) }}
            className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 font-mono text-sm outline-none rounded"
              style={{ background: '#F4F4F5', border: '1px solid #E4E4E7', color: '#09090B' }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 font-display font-700 text-sm tracking-widest rounded transition-colors duration-150"
              style={{ background: '#09090B', color: '#FAFAFA' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#18181B')}
              onMouseLeave={e => (e.currentTarget.style.background = '#09090B')}
            >
              REQUEST ACCESS
            </button>
          </form>
        ) : (
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 font-display font-700 text-sm tracking-widest rounded"
            style={{ background: '#F4F4F5', color: '#09090B' }}
          >
            <CheckIcon /> ON THE LIST — WE'LL BE IN TOUCH.
          </div>
        )}

        <p className="mt-5 font-mono text-xs" style={{ color: '#A1A1AA' }}>
          No spam. No sales calls. Just a note when your account is ready.
        </p>
      </div>
    </section>
  )
}