import { useState } from "react";
import { SITE_RECIPE, SITE_VARIANTS } from "@/modules/landing/auth/utils/data";
import { typeTag, typeColor } from "@/modules/landing/components/Utils";
import { ArrowRightIcon } from "@/modules/landing/components/Icons";

// Explains the site-conditions feature: the same recipe behaves differently on
// different ground, so users keep one variant per condition. The visitor picks a
// condition on the left and sees that variant's lines on the right; lines that
// exist only because of the ground are flagged SITE-SPECIFIC.
export function SiteConditions() {
  const [active, setActive] = useState(0);
  const variant = SITE_VARIANTS[active];

  return (
    <section id="site-conditions" className="py-24 max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky lg:top-24">
          <p className="font-mono text-xs mb-4" style={{ color: "#B89B6E" }}>
            SITE CONDITIONS
          </p>
          <h2
            className="font-display font-800 leading-none mb-6"
            style={{
              fontSize: "clamp(32px, 3.5vw, 48px)",
              color: "#2B1B0E",
              letterSpacing: "-0.01em",
            }}
          >
            SAME SLAB.
            <br />
            DIFFERENT GROUND.
            <br />
            DIFFERENT RECIPE.
          </h2>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: "#9C7B4F" }}
          >
            A slab on muddy ground needs geotextile matting, a deeper sub-base,
            and more concrete. A slab on firm ground doesn't. Quanta lets you
            keep purpose-built variants of the same recipe — firm ground, soft
            ground, coastal, fill — and pick the right one when it matters.
          </p>

          <div className="flex flex-col gap-2 mt-8">
            {SITE_VARIANTS.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setActive(i)}
                className="flex items-center gap-3 px-4 py-3 text-left rounded transition-all duration-150 cursor-pointer"
                style={{
                  background: active === i ? "#FFFFFF" : "transparent",
                  border: `1px solid ${active === i ? "#2B1B0E" : "#F3DEC0"}`,
                  color: active === i ? "#2B1B0E" : "#9C7B4F",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: active === i ? "#2B1B0E" : "#F3DEC0" }}
                />
                <div>
                  <div className="font-display font-600 text-sm tracking-wide">
                    {v.label.toUpperCase()}
                  </div>
                  <div
                    className="font-mono text-xs"
                    style={{ color: active === i ? "#6B4F2E" : "#B89B6E" }}
                  >
                    {v.tag}
                  </div>
                </div>
                {active === i && <ArrowRightIcon />}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #F3DEC0",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            className="px-6 py-5"
            style={{ borderBottom: "1px solid #F3DEC0" }}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span
                className="font-display font-700 text-sm tracking-widest"
                style={{ color: "#2B1B0E" }}
              >
                {SITE_RECIPE.name.toUpperCase()} · {variant.label.toUpperCase()}
              </span>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{ background: "#F3DEC0", color: "#9C7B4F" }}
              >
                {variant.tag.toUpperCase()}
              </span>
            </div>
            <p className="font-mono text-xs" style={{ color: "#B89B6E" }}>
              {SITE_RECIPE.category} · per {SITE_RECIPE.unit}
            </p>
          </div>

          <div className="px-6 py-4">
            <p className="font-mono text-xs mb-3" style={{ color: "#B89B6E" }}>
              PER 1 {SITE_RECIPE.unit}
            </p>
            {variant.items.map((item:any) => {
              const isExtra = variant.extra?.includes(item.name);
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: "1px solid #F3DEC0" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-xs w-7"
                      style={{ color: typeColor(item.type) }}
                    >
                      {typeTag(item.type)}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: isExtra ? "#2B1B0E" : "#6B4F2E" }}
                    >
                      {item.name}
                    </span>
                    {isExtra && (
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: "#F3DEC0",
                          color: "#9C7B4F",
                          fontSize: "10px",
                        }}
                      >
                        SITE-SPECIFIC
                      </span>
                    )}
                  </div>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "#B89B6E" }}
                  >
                    {item.qty} {item.unit.split("/")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            className="px-6 py-4"
            style={{ background: "#FFE9D2", borderTop: "1px solid #F3DEC0" }}
          >
            <p className="font-mono text-xs" style={{ color: "#B89B6E" }}>
              {variant.items.length} line items · {SITE_RECIPE.category} category
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}