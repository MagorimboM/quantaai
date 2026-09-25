export function ProblemSection() {
  const problems = [
    {
      n: '01',
      title: "SAME CALCULATION. EVERY JOB.",
      body: "How many bricks for 40m² of wall? You already know — you've done it a hundred times. But you're still working it out by hand every single time.",
    },
    {
      n: '02',
      title: 'ONE WRONG NUMBER. CASCADING ERRORS.',
      body: "Brick count leads to mortar volume leads to delivery quantities. One typo in the spreadsheet and the whole takeoff is off. You don't catch it until the job is short on site.",
    },
    {
      n: '03',
      title: "GENERIC TEMPLATES DON'T FIT.",
      body: 'A slab on muddy ground needs geotextile and extra sub-base. A coastal wall needs different mortar. But your spreadsheet has one column for everything.',
    },
  ]

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <p className="font-mono text-xs mb-4" style={{ color: '#52525B' }}>THE PROBLEM</p>
      <h2
        className="font-display font-800 leading-none mb-14"
        style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: '#FAFAFA', letterSpacing: '-0.01em' }}
      >
        YOU'VE DONE EVERY
        <br />
        TAKEOFF TWICE.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: '#27272A' }}>
        {problems.map(p => (
          <div key={p.n} className="p-8" style={{ background: '#09090B' }}>
            <div className="font-mono text-4xl font-400 mb-6" style={{ color: '#27272A' }}>{p.n}</div>
            <h3 className="font-display font-700 text-base tracking-wide mb-4" style={{ color: '#FAFAFA' }}>{p.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
