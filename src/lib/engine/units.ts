// Table d'unités (facteur vers l'unité SI de la grandeur) pour valider les unités et conversions.

const U: Record<string, { dim: string; f: number }> = {
  mm: { dim: "L", f: 1e-3 }, cm: { dim: "L", f: 1e-2 }, dm: { dim: "L", f: 0.1 }, m: { dim: "L", f: 1 }, km: { dim: "L", f: 1e3 },
  mg: { dim: "M", f: 1e-6 }, g: { dim: "M", f: 1e-3 }, kg: { dim: "M", f: 1 }, t: { dim: "M", f: 1e3 },
  ms: { dim: "T", f: 1e-3 }, s: { dim: "T", f: 1 }, min: { dim: "T", f: 60 }, h: { dim: "T", f: 3600 },
  "m/s": { dim: "V", f: 1 }, "km/h": { dim: "V", f: 1 / 3.6 },
  mL: { dim: "Vol", f: 1e-6 }, cL: { dim: "Vol", f: 1e-5 }, dL: { dim: "Vol", f: 1e-4 }, L: { dim: "Vol", f: 1e-3 },
  "cm³": { dim: "Vol", f: 1e-6 }, "dm³": { dim: "Vol", f: 1e-3 }, "m³": { dim: "Vol", f: 1 },
  mV: { dim: "U", f: 1e-3 }, V: { dim: "U", f: 1 }, kV: { dim: "U", f: 1e3 },
  mA: { dim: "I", f: 1e-3 }, A: { dim: "I", f: 1 },
  "Ω": { dim: "R", f: 1 }, "kΩ": { dim: "R", f: 1e3 },
  J: { dim: "E", f: 1 }, kJ: { dim: "E", f: 1e3 }, MJ: { dim: "E", f: 1e6 }, Wh: { dim: "E", f: 3600 }, kWh: { dim: "E", f: 3.6e6 },
  W: { dim: "P", f: 1 }, kW: { dim: "P", f: 1e3 },
  mmol: { dim: "n", f: 1e-3 }, mol: { dim: "n", f: 1 },
  "mol/L": { dim: "C", f: 1 }, "mmol/L": { dim: "C", f: 1e-3 },
  "g/L": { dim: "Cm", f: 1 }, "mg/L": { dim: "Cm", f: 1e-3 },
  N: { dim: "F", f: 1 }, kN: { dim: "F", f: 1e3 },
  Hz: { dim: "f", f: 1 }, kHz: { dim: "f", f: 1e3 },
  "g/mol": { dim: "Mm", f: 1 },
  "°": { dim: "ang", f: 1 },
};

export function unitDim(u: string): string | undefined {
  return U[u]?.dim;
}

/** Convertit `value` exprimée en `from` vers l'unité `to` (même grandeur). */
export function convert(value: number, from: string, to: string): number | null {
  const a = U[from];
  const b = U[to];
  if (!a || !b || a.dim !== b.dim) return null;
  return (value * a.f) / b.f;
}

export function isKnownUnit(u: string) {
  return u in U;
}
