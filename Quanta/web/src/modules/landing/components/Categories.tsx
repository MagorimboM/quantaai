import { CATEGORIES } from "@/modules/landing/components/Data";

export function Categories() {
  return (
    <section
      id="categories"
      className="py-24"
      style={{ background: "#FFEFDD" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end mb-14">
          <div>
            <p className="font-mono text-xs mb-4" style={{ color: "#B89B6E" }}>
              ORGANISED BY TRADE
            </p>
            <h2
              className="font-display font-800 leading-none"
              style={{
                fontSize: "clamp(32px, 4.5vw, 52px)",
                color: "#2B1B0E",
                letterSpacing: "-0.01em",
              }}
            >
              YOUR WHOLE
              <br />
              CATALOGUE,
              <br />
              IN ORDER.
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#9C7B4F" }}>
            Every recipe sits under a trade category. Materials, labour, and
            overheads are classified the same way across all of them. As your
            library grows, it stays organised and searchable — not a flat
            spreadsheet you dig through to find the right template.
          </p>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-px"
          style={{ background: "#F3DEC0" }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="p-8 cursor-pointer transition-colors duration-150"
                style={{ background: "#FFEFDD" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#FFFFFF")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#FFEFDD")
                }
              >
                <div className="mb-4" style={{ color: "#9C7B4F" }}>
                  <Icon />
                </div>
                <div
                  className="font-display font-700 text-base tracking-wide mb-1"
                  style={{ color: "#2B1B0E" }}
                >
                  {cat.name.toUpperCase()}
                </div>
                <div className="font-mono text-xs" style={{ color: "#B89B6E" }}>
                  {cat.count} recipes
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
