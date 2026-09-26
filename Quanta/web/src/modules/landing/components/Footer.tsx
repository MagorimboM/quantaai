export function Footer() {
  return (
    <footer className="py-8" style={{ background: '#FFF8F0', borderTop: '1px solid #FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-display font-800 text-base tracking-widest" style={{ color: '#2B1B0E' }}>QUANTA</div>
        <p className="font-mono text-xs" style={{ color: '#B89B6E' }}>
          © {new Date().getFullYear()} Quanta. Quantity takeoff software.
        </p>
        <div className="flex items-center gap-6 font-mono text-xs" style={{ color: '#B89B6E' }}>
          <a href="#" className="hover:text-zinc-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-500 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}