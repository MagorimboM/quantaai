import { useState } from 'react'
import { CheckIcon } from '@/modules/landing/components/Icons'

export function CTASection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section id="cta" className="py-32" style={{ background: '#FFFFFF' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2
          className="font-display font-900 leading-none mb-6"
          style={{ fontSize: 'clamp(44px, 6vw, 80px)', color: '#2B1B0E', letterSpacing: '-0.02em' }}
        >
          STOP DOING
          <br />
          THE MATHS
          <br />
          TWICE.
        </h2>
        <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: '#9C7B4F' }}>
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
              style={{ background: '#FFF8F0', border: '1px solid #F3DEC0', color: '#2B1B0E' }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 font-display font-700 text-sm tracking-widest rounded transition-colors duration-150"
              style={{ background: '#FF6B35', color: '#FFFFFF' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#E85A28')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FF6B35')}
            >
              REQUEST ACCESS
            </button>
          </form>
        ) : (
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 font-display font-700 text-sm tracking-widest rounded"
            style={{ background: '#FFF8F0', color: '#2B1B0E' }}
          >
            <CheckIcon /> ON THE LIST — WE'LL BE IN TOUCH.
          </div>
        )}

        <p className="mt-5 font-mono text-xs" style={{ color: '#B89B6E' }}>
          No spam. No sales calls. Just a note when your account is ready.
        </p>
      </div>
    </section>
  )
}