import type { GetBillOfQuantsResponse } from "@/modules/quantityTakeoff/contracts/quantityTakeOff.response";

// Countable units can't be fractional on an order form, so they round up.
// Everything else shows up to two decimals.
const COUNTABLE_UNITS = new Set(["Nr", "nr", "No", "no"]);

export function formatQuantity(value: number, unit: string): string {
  if (COUNTABLE_UNITS.has(unit)) {
    return Math.ceil(value - 1e-9).toLocaleString();
  }
  return (Math.round(value * 100) / 100).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

// Recipe rates are shown as stored (never rounded up), e.g. 0.02 m³ per m².
export function formatRate(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function calculateTotal(ratePerUnit: number, measurement: number): number {
  return ratePerUnit * measurement;
}

export type AggregatedComponent = {
  key: string;
  name: string;
  unit: string;
  total: number;
};

export type AggregatedQuantities = {
  materials: AggregatedComponent[];
  labour: AggregatedComponent[];
  overheads: AggregatedComponent[];
};

// Adds up every component across every line item, so ten walls using the
// same brick show as one combined brick total.
export function aggregateQuantities(
  lineItems: GetBillOfQuantsResponse[],
): AggregatedQuantities {
  const materials = new Map<string, AggregatedComponent>();
  const labour = new Map<string, AggregatedComponent>();
  const overheads = new Map<string, AggregatedComponent>();

  function add(
    map: Map<string, AggregatedComponent>,
    id: string,
    name: string,
    unit: string,
    amount: number,
  ) {
    const key = `${id}|${unit}`;
    const existing = map.get(key);
    if (existing) {
      existing.total += amount;
    } else {
      map.set(key, { key, name, unit, total: amount });
    }
  }

  for (const item of lineItems) {
    if (!item.recipe) continue;

    for (const m of item.recipe.recipeMaterials) {
      add(materials, m.material.id, m.material.name, m.unit, calculateTotal(m.quantity, item.measurement));
    }
    for (const l of item.recipe.recipeLabour) {
      add(labour, l.labour.id, l.labour.name, l.unit, calculateTotal(l.quantity, item.measurement));
    }
    for (const o of item.recipe.recipeOverheads) {
      add(overheads, o.overhead.id, o.overhead.name, o.unit, calculateTotal(o.quantity, item.measurement));
    }
  }

  const sorted = (map: Map<string, AggregatedComponent>) =>
    [...map.values()].sort((a, b) => a.name.localeCompare(b.name));

  return {
    materials: sorted(materials),
    labour: sorted(labour),
    overheads: sorted(overheads),
  };
}