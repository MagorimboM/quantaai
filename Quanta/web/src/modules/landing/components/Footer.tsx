import { useNavigate } from 'react-router'

export function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="py-8" style={{ background: '#FFF8F0', borderTop: '1px solid #FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-display font-800 text-base tracking-widest" style={{ color: '#2B1B0E' }}>QUANTA</div>
        <p className="font-mono text-xs" style={{ color: '#B89B6E' }}>
          © {new Date().getFullYear()} Quanta. Quantity takeoff software.
        </p>
        <div className="flex items-center gap-6 font-mono text-xs" style={{ color: '#B89B6E' }}>
          <button onClick={() => navigate('/login')} className="hover:opacity-70 transition-opacity cursor-pointer">Log in</button>
          <a href="#" className="hover:opacity-70 transition-opacity">Privacy</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Terms</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Contact</a>
        </div>
      </div>
    </footer>
  )
}