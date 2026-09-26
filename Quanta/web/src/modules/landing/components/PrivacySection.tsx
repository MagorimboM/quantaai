import { CheckIcon } from '@/modules/landing/components/Icons'

export function PrivacySection() {
  const points = [
    "Your templates are yours — built once, usable on any job, for any company or none at all.",
    "On-site for an employer today, quoting your own job tonight — the same recipes work either way.",
    'Upload site documents and specs — the AI reads them, nothing else does.',
    "No public marketplace. No community templates that expose your methods.",
  ]

  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-xs mb-4" style={{ color: '#B89B6E' }}>BUILT AROUND YOU</p>
          <h2
            className="font-display font-800 leading-none mb-6"
            style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', color: '#2B1B0E', letterSpacing: '-0.01em' }}
          >
            YOUR TEMPLATES.
            <br />
            ANY JOB.
            <br />
            ANYWHERE.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#9C7B4F' }}>
            You turn up to a job — maybe it's for a company, maybe it's your own — and realise you need a template for this. That's the moment Quanta is built for. Your recipes belong to you, not your employer, and they're there whether you're on someone else's site or working for yourself after hours.
          </p>
          <div className="flex flex-col gap-3">
            {points.map((pt, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5 rounded"
                  style={{ background: '#FFF3E5', border: '1px solid #F3DEC0', color: '#6B4F2E' }}
                >
                  <CheckIcon />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#9C7B4F' }}>{pt}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* AI card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #F3DEC0', borderRadius: '6px', padding: '24px' }}>
            <div className="font-display font-700 text-sm tracking-widest mb-2" style={{ color: '#2B1B0E' }}>
              AI DOCUMENT ASSISTANT
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#9C7B4F' }}>
              Upload site specs or engineer drawings. Ask natural-language questions. Get answers drawn from your actual project files.
            </p>
            <div className="font-mono text-xs p-3 rounded" style={{ background: '#FFEFDD', color: '#9C7B4F', border: '1px solid #F3DEC0' }}>
              <span style={{ color: '#6B4F2E' }}>&gt; </span>
              <span style={{ color: '#2B1B0E' }}>What concrete strength is specified for the ground floor slab?</span>
              <br /><br />
              <span style={{ color: '#B89B6E' }}>Reading site specification v4.2 …</span>
              <br />
              <span style={{ color: '#6B4F2E' }}>32 MPa as per clause 4.3.1, page 12.</span>
            </div>
          </div>

          {/* Privacy card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #F3DEC0', borderRadius: '6px', padding: '24px' }}>
            <div className="font-display font-700 text-sm tracking-widest mb-2" style={{ color: '#2B1B0E' }}>
              STRICTLY PRIVATE
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#9C7B4F' }}>
              No other company sees your recipes, your measurements, or your project data. Your takeoff methods are yours — not shared, not benchmarked, not leaked.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}