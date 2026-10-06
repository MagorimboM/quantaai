import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  DEMO_RECIPE,
  DEMO_MEASUREMENT,
  HERO_STATS,
} from "@/modules/landing/auth/utils/data";
import { fmt, typeTag, typeColor } from "@/modules/landing/components/Utils";
import { ArrowRightIcon } from "@/modules/landing/components/Icons";

// Measurements the demo cycles through until the visitor types their own
const DEMO_MEASUREMENTS = [DEMO_MEASUREMENT, 65.2, 28.5, 52.0];
const DEMO_CYCLE_MS = 2200;

// The product in miniature: a brick wall recipe (per 1 m²) and one measurement.
// Every quantity below is the recipe line multiplied by that measurement.
// It cycles through example measurements by itself; the moment the visitor
// clicks the box or types, it stops and follows what they enter.
// Needs the pulseDemo and count-animate styles from the landing page CSS.
function HeroDemo() {
  const [area, setArea] = useState(DEMO_MEASUREMENT);
  // Changing this key remounts the result rows, which replays their count-up animation
  const [animationKey, setAnimationKey] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    if (!isAuto) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % DEMO_MEASUREMENTS.length;
      setArea(DEMO_MEASUREMENTS[index]);
      setAnimationKey((key) => key + 1);
    }, DEMO_CYCLE_MS);
    return () => clearInterval(interval);
  }, [isAuto]);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #F3DEC0",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #F3DEC0" }}>
        <div className="flex items-center justify-between mb-0.5">
          <span
            className="font-display font-700 text-sm tracking-widest"
            style={{ color: "#2B1B0E" }}
          >
            {DEMO_RECIPE.name.toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            {isAuto && (
              <span
                className="flex items-center gap-1.5 font-mono text-xs"
                style={{ color: "#B89B6E" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#9C7B4F",
                    animation: "pulseDemo 1.8s ease-in-out infinite",
                  }}
                />
                LIVE
              </span>
            )}
            <span
              className="font-mono text-xs px-2 py-0.5"
              style={{ background: "#F3DEC0", color: "#9C7B4F" }}
            >
              RECIPE
            </span>
          </div>
        </div>
        <p className="font-mono text-xs" style={{ color: "#B89B6E" }}>
          {DEMO_RECIPE.category} · per {DEMO_RECIPE.unit}
        </p>
      </div>

      {/* The recipe: what goes into 1 unit of work.
          Units are stored as "total unit/measurement unit"; only the first part is shown. */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid #F3DEC0" }}>
        <p className="font-mono text-xs mb-2" style={{ color: "#B89B6E" }}>
          PER 1 {DEMO_RECIPE.unit}
        </p>
        {DEMO_RECIPE.items.map((item: any) => (
          <div
            key={item.name}
            className="flex items-center justify-between py-1"
          >
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs w-7"
                style={{ color: typeColor(item.type) }}
              >
                {typeTag(item.type)}
              </span>
              <span className="text-sm" style={{ color: "#6B4F2E" }}>
                {item.name}
              </span>
            </div>
            <span className="font-mono text-xs" style={{ color: "#B89B6E" }}>
              {item.qty} {item.unit.split("/")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* The one measurement the user enters */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #F3DEC0" }}>
        <p className="font-mono text-xs mb-2" style={{ color: "#B89B6E" }}>
          MEASUREMENT
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={area}
            onFocus={() => setIsAuto(false)}
            onChange={(e) => {
              setIsAuto(false);
              const n = parseFloat(e.target.value);
              if (!isNaN(n) && n >= 0) {
                setArea(n);
                setAnimationKey((key) => key + 1);
              }
            }}
            className="font-mono text-2xl font-500 w-28 bg-transparent outline-none text-right border-b pb-1"
            style={{ color: "#2B1B0E", borderColor: "#F3DEC0" }}
            min="0"
            step="0.1"
          />
          <span
            className="font-display font-600 text-lg"
            style={{ color: "#9C7B4F" }}
          >
            {DEMO_RECIPE.unit}
          </span>
        </div>
      </div>

      {/* The result: every recipe line multiplied by the measurement */}
      <div className="px-5 py-4">
        <p className="font-mono text-xs mb-3" style={{ color: "#9C7B4F" }}>
          QUANTITIES
        </p>
        {DEMO_RECIPE.items.map((item: any) => (
          <div
            key={`${animationKey}-${item.name}`}
            className="flex items-center justify-between py-1 count-animate"
          >
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs w-7"
                style={{ color: typeColor(item.type) }}
              >
                {typeTag(item.type)}
              </span>
              <span className="text-sm" style={{ color: "#6B4F2E" }}>
                {item.name}
              </span>
            </div>
            <span
              className="font-mono font-500 text-sm"
              style={{ color: "#2B1B0E" }}
            >
              {fmt(item.qty * area)}{" "}
              <span style={{ color: "#B89B6E", fontSize: "11px" }}>
                {item.unit.split("/")[0]}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// First screen of the landing page: the promise (measure once), the single
// call to action (register), and the demo that proves it.
export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-14">
      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-24">
        <div>
          <div
            className="inline-flex items-center gap-2 text-xs font-mono mb-8 px-3 py-1.5 rounded"
            style={{ border: "1px solid #F3DEC0", color: "#9C7B4F" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#B89B6E" }}
            />
            QUANTITY TAKEOFF SOFTWARE
          </div>

          <h1
            className="font-display font-900 leading-none mb-6"
            style={{
              fontSize: "clamp(48px, 6.5vw, 80px)",
              color: "#2B1B0E",
              letterSpacing: "-0.01em",
            }}
          >
            MEASURE ONCE.
            <br />
            QUANTA
            <br />
            CALCULATES
            <br />
            EVERYTHING ELSE.
          </h1>

          <p
            className="text-base mb-8 max-w-md leading-relaxed"
            style={{ color: "#9C7B4F" }}
          >
            Build a recipe for each type of work. Enter one measurement on site.
            Get every material quantity, labour hour, and overhead worked out
            automatically.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {/* The one orange element in this section: the action we want */}
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-display font-700 text-sm tracking-widest transition-all duration-150 rounded cursor-pointer"
              style={{ background: "#FF6B35", color: "#FFFFFF" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#E85A28")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FF6B35")
              }
            >
              REGISTER <ArrowRightIcon />
            </button>
            <a
              href="#how-it-works"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: "#B89B6E" }}
            >
              See how it works →
            </a>
          </div>

          <div
            className="flex items-center gap-10 mt-12 pt-8"
            style={{ borderTop: "1px solid #F3DEC0" }}
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <div
                  className="font-display font-800 text-xl"
                  style={{ color: "#2B1B0E" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: "#B89B6E" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}
