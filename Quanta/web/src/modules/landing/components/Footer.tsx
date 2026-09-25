export function Footer() {
  return (
    <footer className="py-8" style={{ background: '#09090B', borderTop: '1px solid #18181B' }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-display font-800 text-base tracking-widest" style={{ color: '#FAFAFA' }}>QUANTA</div>
        <p className="font-mono text-xs" style={{ color: '#3F3F46' }}>
          © {new Date().getFullYear()} Quanta. Quantity takeoff software.
        </p>
        <div className="flex items-center gap-6 font-mono text-xs" style={{ color: '#3F3F46' }}>
          <a href="#" className="hover:text-zinc-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-500 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}