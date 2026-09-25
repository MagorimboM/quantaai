export function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'BUILD A RECIPE',
      body: 'Define exactly what goes into one unit of work — materials, labour, overheads. Do it once for "110mm Brick Wall". Build your library over time.',
      detail: '60 bricks + 0.015 m³ mortar + 1.2 hrs bricklayer per m²',
    },
    {
      n: '2',
      title: 'ENTER ONE MEASUREMENT',
      body: "On site or from plans, measure the job. Enter that single number — 40.8 m² of wall face, say. That's it.",
      detail: '40.8 m² of wall',
    },
    {
      n: '3',
      title: 'GET THE FULL BREAKDOWN',
      body: 'Quanta multiplies every line of the recipe by your measurement. A complete quantity list, no spreadsheet, no calculator.',
      detail: '2,448 bricks · 0.61 m³ mortar · 49 hrs labour',
    },
  ]

  return (
    <section id="how-it-works" className="py-24" style={{ background: '#0C0C0E' }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs mb-4" style={{ color: '#52525B' }}>HOW IT WORKS</p>
        <h2
          className="font-display font-800 leading-none mb-14"
          style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: '#FAFAFA', letterSpacing: '-0.01em' }}
        >
          THREE STEPS.
          <br />
          ONE MEASUREMENT.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px" style={{ background: '#27272A' }}>
          {steps.map(step => (
            <div key={step.n} className="p-8" style={{ background: '#0C0C0E' }}>
              <div
                className="w-9 h-9 flex items-center justify-center font-display font-800 text-base mb-6 rounded"
                style={{ background: '#18181B', color: '#FAFAFA', border: '1px solid #3F3F46' }}
              >
                {step.n}
              </div>
              <h3 className="font-display font-700 text-base tracking-wide mb-3" style={{ color: '#FAFAFA' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#71717A' }}>{step.body}</p>
              <div
                className="font-mono text-xs px-3 py-2 rounded"
                style={{ background: '#18181B', color: '#A1A1AA', border: '1px solid #3F3F46' }}
              >
                {step.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
