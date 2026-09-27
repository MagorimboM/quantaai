import { useNavigate } from 'react-router'
 
export function CTASection() {
  const navigate = useNavigate()
 
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
          Create your account and start building your own recipe library today.
        </p>
 
        <button
          onClick={() => navigate('/register')}
          className="px-6 py-3 font-display font-700 text-sm tracking-widest rounded transition-colors duration-150 cursor-pointer"
          style={{ background: '#FF6B35', color: '#FFFFFF' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#E85A28')}
          onMouseLeave={e => (e.currentTarget.style.background = '#FF6B35')}
        >
          REGISTER
        </button>
 
        <p className="mt-5 font-mono text-xs" style={{ color: '#B89B6E' }}>
          No spam. No sales calls. Just Quanta.
        </p>
      </div>
    </section>
  )
}
 