function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function PrivacySection() {
  const points = [
    "Your recipes are yours. They don't sync to other companies or users.",
    'Project data stays in your account. No cross-company visibility, ever.',
    'Upload site documents and specs — the AI reads them, nothing else does.',
    "No public marketplace. No community templates that expose your methods.",
  ]

  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-xs mb-4" style={{ color: '#52525B' }}>FOR YOUR BUSINESS</p>
          <h2
            className="font-display font-800 leading-none mb-6"
            style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', color: '#FAFAFA', letterSpacing: '-0.01em' }}
          >
            BUILT FOR ONE
            <br />
            COMPANY.
            <br />
            NOT A TEAM.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#71717A' }}>
            Most takeoff software is built for estimating departments. Quanta is built for the person who runs the company and does the takeoff themselves — where your methods are your competitive edge.
          </p>
          <div className="flex flex-col gap-3">
            {points.map((pt, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5 rounded"
                  style={{ background: '#1E1E21', border: '1px solid #3F3F46', color: '#A1A1AA' }}
                >
                  <CheckIcon />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>{pt}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* AI card */}
          <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '6px', padding: '24px' }}>
            <div className="font-display font-700 text-sm tracking-widest mb-2" style={{ color: '#FAFAFA' }}>
              AI DOCUMENT ASSISTANT
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#71717A' }}>
              Upload site specs or engineer drawings. Ask natural-language questions. Get answers drawn from your actual project files.
            </p>
            <div className="font-mono text-xs p-3 rounded" style={{ background: '#0C0C0E', color: '#71717A', border: '1px solid #27272A' }}>
              <span style={{ color: '#A1A1AA' }}>&gt; </span>
              <span style={{ color: '#FAFAFA' }}>What concrete strength is specified for the ground floor slab?</span>
              <br /><br />
              <span style={{ color: '#52525B' }}>Reading site specification v4.2 …</span>
              <br />
              <span style={{ color: '#A1A1AA' }}>32 MPa as per clause 4.3.1, page 12.</span>
            </div>
          </div>

          {/* Privacy card */}
          <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '6px', padding: '24px' }}>
            <div className="font-display font-700 text-sm tracking-widest mb-2" style={{ color: '#FAFAFA' }}>
              STRICTLY PRIVATE
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>
              No other company sees your recipes, your measurements, or your project data. Your takeoff methods are yours — not shared, not benchmarked, not leaked.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
