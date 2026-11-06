// Générateurs de figures SVG (rendu identique serveur/navigateur, aucune dépendance).
import { fr } from "./numbers";

const C = {
  ink: "#1e293b",
  grid: "#e2e8f0",
  axis: "#475569",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#16a34a",
  orange: "#ea580c",
  violet: "#7c3aed",
  fill: "#dbeafe",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const wrap = (w: number, h: number, body: string, label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" style="width:100%;max-width:${w}px;height:auto;font-family:Inter,Arial,sans-serif">${body}</svg>`;
const text = (x: number, y: number, s: string, o: { size?: number; anchor?: string; color?: string; weight?: number; italic?: boolean } = {}) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.size ?? 14}" text-anchor="${o.anchor ?? "middle"}" dominant-baseline="middle" fill="${o.color ?? C.ink}"${o.weight ? ` font-weight="${o.weight}"` : ""}${o.italic ? ' font-style="italic"' : ""}>${esc(s)}</text>`;

// ---------- Triangles ----------
export function triangle(opts: {
  pts: [number, number][]; // 3 sommets en unités arbitraires
  names: [string, string, string];
  rightAngleAt?: number;
  sideLabels?: (string | null)[]; // côté i = [i, i+1]
  angleLabel?: { at: number; text: string };
  title: string;
}) {
  const W = 360, H = 260, pad = 40;
  const xs = opts.pts.map((p) => p[0]), ys = opts.pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1));
  const P = opts.pts.map(([x, y]) => [pad + (x - minX) * s + ((W - 2 * pad) - (maxX - minX) * s) / 2, H - pad - (y - minY) * s - ((H - 2 * pad) - (maxY - minY) * s) / 2]);
  const cx = (P[0][0] + P[1][0] + P[2][0]) / 3, cy = (P[0][1] + P[1][1] + P[2][1]) / 3;
  let body = `<polygon points="${P.map((p) => p.join(",")).join(" ")}" fill="${C.fill}" stroke="${C.blue}" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (opts.rightAngleAt !== undefined) {
    const i = opts.rightAngleAt, A = P[i], B = P[(i + 1) % 3], D = P[(i + 2) % 3];
    const u = (Q: number[]) => { const dx = Q[0] - A[0], dy = Q[1] - A[1], n = Math.hypot(dx, dy); return [(dx / n) * 14, (dy / n) * 14]; };
    const a = u(B), b = u(D);
    body += `<polyline points="${A[0] + a[0]},${A[1] + a[1]} ${A[0] + a[0] + b[0]},${A[1] + a[1] + b[1]} ${A[0] + b[0]},${A[1] + b[1]}" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`;
  }
  P.forEach((p, i) => {
    const dx = p[0] - cx, dy = p[1] - cy, n = Math.hypot(dx, dy) || 1;
    body += text(p[0] + (dx / n) * 18, p[1] + (dy / n) * 18, opts.names[i], { size: 17, weight: 600 });
  });
  opts.sideLabels?.forEach((lab, i) => {
    if (!lab) return;
    const A = P[i], B = P[(i + 1) % 3];
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    const dx = mx - cx, dy = my - cy, n = Math.hypot(dx, dy) || 1;
    const off = 14 + lab.length * 3.6 * Math.abs(dx / n) + 6 * Math.abs(dy / n);
    body += text(mx + (dx / n) * off, my + (dy / n) * off, lab, { size: 15, color: C.red, weight: 600 });
  });
  if (opts.angleLabel) {
    const i = opts.angleLabel.at, A = P[i], B = P[(i + 1) % 3], D = P[(i + 2) % 3];
    const ang = (Q: number[]) => Math.atan2(Q[1] - A[1], Q[0] - A[0]);
    let a1 = ang(B), a2 = ang(D);
    if (a2 - a1 > Math.PI) a1 += 2 * Math.PI;
    if (a1 - a2 > Math.PI) a2 += 2 * Math.PI;
    const r = 30;
    body += `<path d="M ${A[0] + r * Math.cos(a1)} ${A[1] + r * Math.sin(a1)} A ${r} ${r} 0 0 ${a2 > a1 ? 1 : 0} ${A[0] + r * Math.cos(a2)} ${A[1] + r * Math.sin(a2)}" fill="none" stroke="${C.orange}" stroke-width="2"/>`;
    const am = (a1 + a2) / 2;
    body += text(A[0] + 48 * Math.cos(am), A[1] + 48 * Math.sin(am), opts.angleLabel.text, { size: 14, color: C.orange, weight: 600 });
  }
  return wrap(W, H, body, opts.title);
}

// ---------- Repère et courbes ----------
export function plot(opts: {
  xmin: number; xmax: number; ymin: number; ymax: number;
  fns?: { f: (x: number) => number; color?: string; label?: string }[];
  points?: { x: number; y: number; label?: string; color?: string }[];
  gridX?: number; gridY?: number; labelX?: number; labelY?: number;
  xName?: string; yName?: string; title: string; width?: number; height?: number;
}) {
  const W = opts.width ?? 440, H = opts.height ?? 340, L = 44, R = 18, T = 18, B = 36;
  const X = (x: number) => L + ((x - opts.xmin) / (opts.xmax - opts.xmin)) * (W - L - R);
  const Y = (y: number) => T + ((opts.ymax - y) / (opts.ymax - opts.ymin)) * (H - T - B);
  const gx = opts.gridX ?? 1, gy = opts.gridY ?? 1, lx = opts.labelX ?? gx, ly = opts.labelY ?? gy;
  let body = `<rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="#fff"/>`;
  const eps = 1e-9;
  for (let x = Math.ceil(opts.xmin / gx) * gx; x <= opts.xmax + eps; x += gx) body += `<line x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${H - B}" stroke="${C.grid}"/>`;
  for (let y = Math.ceil(opts.ymin / gy) * gy; y <= opts.ymax + eps; y += gy) body += `<line x1="${L}" y1="${Y(y)}" x2="${W - R}" y2="${Y(y)}" stroke="${C.grid}"/>`;
  const x0 = opts.xmin <= 0 && opts.xmax >= 0 ? X(0) : L;
  const y0 = opts.ymin <= 0 && opts.ymax >= 0 ? Y(0) : H - B;
  body += `<line x1="${L}" y1="${y0}" x2="${W - R + 6}" y2="${y0}" stroke="${C.axis}" stroke-width="1.6" marker-end="url(#ar)"/>`;
  body += `<line x1="${x0}" y1="${H - B}" x2="${x0}" y2="${T - 6}" stroke="${C.axis}" stroke-width="1.6" marker-end="url(#ar)"/>`;
  body = `<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.axis}"/></marker></defs>` + body;
  for (let x = Math.ceil(opts.xmin / lx) * lx; x <= opts.xmax + eps; x += lx) {
    if (Math.abs(x) < eps && opts.ymin <= 0) { body += text(x0 - 9, y0 + 12, "0", { size: 11, color: C.axis }); continue; }
    body += `<line x1="${X(x)}" y1="${y0 - 3}" x2="${X(x)}" y2="${y0 + 3}" stroke="${C.axis}"/>` + text(X(x), y0 + 14, fr(x, 3), { size: 11, color: C.axis });
  }
  for (let y = Math.ceil(opts.ymin / ly) * ly; y <= opts.ymax + eps; y += ly) {
    if (Math.abs(y) < eps) continue;
    body += `<line x1="${x0 - 3}" y1="${Y(y)}" x2="${x0 + 3}" y2="${Y(y)}" stroke="${C.axis}"/>` + text(x0 - 8, Y(y), fr(y, 3), { size: 11, color: C.axis, anchor: "end" });
  }
  if (opts.xName) body += text(W - R, y0 - 12, opts.xName, { size: 12, anchor: "end", italic: true, color: C.axis });
  if (opts.yName) body += text(x0 + 8, T + 4, opts.yName, { size: 12, anchor: "start", italic: true, color: C.axis });
  body += `<clipPath id="cp"><rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/></clipPath>`;
  const colors = [C.blue, C.red, C.green, C.violet];
  (opts.fns ?? []).forEach((fn, k) => {
    let d = "", pen = false;
    const N = 400;
    for (let i = 0; i <= N; i++) {
      const x = opts.xmin + ((opts.xmax - opts.xmin) * i) / N;
      const y = fn.f(x);
      if (!Number.isFinite(y) || y < opts.ymin - 50 || y > opts.ymax + 50) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)} `;
      pen = true;
    }
    body += `<path d="${d}" fill="none" stroke="${fn.color ?? colors[k % 4]}" stroke-width="2.6" clip-path="url(#cp)"/>`;
    if (fn.label) {
      const xl = opts.xmin + (opts.xmax - opts.xmin) * 0.85, yl = fn.f(xl);
      if (yl > opts.ymin && yl < opts.ymax) body += text(X(xl), Y(yl) - 14, fn.label, { size: 14, color: fn.color ?? colors[k % 4], weight: 600, italic: true });
    }
  });
  (opts.points ?? []).forEach((p) => {
    body += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" fill="${p.color ?? C.red}"/>`;
    if (p.label) body += text(X(p.x) + 10, Y(p.y) - 12, p.label, { size: 13, weight: 600, color: p.color ?? C.red });
  });
  return wrap(W, H, body, opts.title);
}

// ---------- Électricité ----------
function resistor(x: number, y: number, label: string, vertical = false) {
  return vertical
    ? `<rect x="${x - 9}" y="${y - 22}" width="18" height="44" fill="#fff" stroke="${C.ink}" stroke-width="2"/>` + text(x + 26, y, label, { size: 13, anchor: "start", weight: 600 })
    : `<rect x="${x - 22}" y="${y - 9}" width="44" height="18" fill="#fff" stroke="${C.ink}" stroke-width="2"/>` + text(x, y - 20, label, { size: 13, weight: 600 });
}
function lamp(x: number, y: number, label: string) {
  return `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="${C.ink}" stroke-width="2"/><path d="M${x - 10},${y - 10} L${x + 10},${y + 10} M${x + 10},${y - 10} L${x - 10},${y + 10}" stroke="${C.ink}" stroke-width="1.6"/>` + text(x, y - 26, label, { size: 13, weight: 600 });
}
function generator(x: number, y: number, label: string) {
  // pile verticale : grand trait = borne +
  return `<rect x="${x - 16}" y="${y - 8}" width="32" height="16" fill="#fff" stroke="none"/><line x1="${x - 14}" y1="${y - 5}" x2="${x + 14}" y2="${y - 5}" stroke="${C.ink}" stroke-width="2.5"/><line x1="${x - 7}" y1="${y + 5}" x2="${x + 7}" y2="${y + 5}" stroke="${C.ink}" stroke-width="4"/>` + text(x - 30, y, label, { size: 13, anchor: "end", weight: 600 }) + text(x + 20, y - 12, "+", { size: 13, color: C.red });
}

export function circuitSeries(dipoles: { type: "R" | "L"; label: string }[], genLabel: string, title: string) {
  const W = 420, H = 230, l = 80, r = 380, t = 50, b = 190;
  let body = `<rect x="${l}" y="${t}" width="${r - l}" height="${b - t}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
  body += generator(l, (t + b) / 2, genLabel);
  const n = dipoles.length;
  dipoles.forEach((d, i) => {
    const x = l + ((r - l) * (i + 1)) / (n + 1);
    body += d.type === "R" ? resistor(x, t, d.label) : lamp(x, t, d.label);
  });
  body += `<path d="M${r - 30},${b - 6} l10,6 l-10,6" fill="none" stroke="${C.red}" stroke-width="2"/>` + text(r - 30, b + 18, "I", { size: 13, color: C.red, italic: true });
  return wrap(W, H, body, title);
}

export function circuitParallel(branches: { label: string; current?: string }[], genLabel: string, mainCurrent: string, title: string) {
  const W = 440, H = 80 + branches.length * 70, l = 70, r = 400, t = 40, b = H - 30;
  let body = `<line x1="${l}" y1="${t}" x2="${r - 100}" y2="${t}" stroke="${C.ink}" stroke-width="2"/><line x1="${l}" y1="${b}" x2="${r - 100}" y2="${b}" stroke="${C.ink}" stroke-width="2"/><line x1="${l}" y1="${t}" x2="${l}" y2="${b}" stroke="${C.ink}" stroke-width="2"/>`;
  body += generator(l, (t + b) / 2, genLabel);
  body += text(l + 40, t - 14, mainCurrent, { size: 13, color: C.red, weight: 600 }) + `<path d="M${l + 55},${t - 6} l10,6 l-10,6" fill="none" stroke="${C.red}" stroke-width="2"/>`;
  const x1 = r - 100, x2 = r;
  const step = (b - t) / Math.max(1, branches.length - 1);
  body += `<line x1="${x1}" y1="${t}" x2="${x1}" y2="${b}" stroke="${C.ink}" stroke-width="2"/><line x1="${x2}" y1="${t}" x2="${x2}" y2="${b}" stroke="${C.ink}" stroke-width="2"/>`;
  branches.forEach((br, i) => {
    const y = branches.length === 1 ? (t + b) / 2 : t + i * step;
    body += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.ink}" stroke-width="2"/>` + lamp((x1 + x2) / 2, y, br.label);
    body += `<circle cx="${x1}" cy="${y}" r="3.5" fill="${C.ink}"/>`;
    if (br.current) body += text(x2 + 8, y - 10, br.current, { size: 13, color: C.red, weight: 600, anchor: "start" });
  });
  return wrap(W, H, body, title);
}

// ---------- Modèle particulaire ----------
export function particlePanels(states: ("solide" | "liquide" | "gaz")[], rand: () => number, title: string) {
  const W = 120 * states.length + 20, H = 170;
  let body = "";
  states.forEach((st, k) => {
    const x0 = 15 + k * 120, y0 = 20, w = 100, h = 110;
    body += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="#f8fafc" stroke="${C.axis}" stroke-width="1.5"/>`;
    const r = 7;
    if (st === "solide") {
      for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) body += `<circle cx="${x0 + 18 + i * 16}" cy="${y0 + h - 14 - j * 16}" r="${r}" fill="${C.blue}"/>`;
    } else if (st === "liquide") {
      let placed = 0, tries = 0; const pts: number[][] = [];
      while (placed < 17 && tries++ < 4000) {
        const x = x0 + 10 + rand() * (w - 20), y = y0 + h - 10 - rand() * 52;
        if (pts.every(([a, b]) => Math.hypot(a - x, b - y) > 2 * r + 0.5)) { pts.push([x, y]); placed++; }
      }
      pts.forEach(([x, y]) => (body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${C.blue}"/>`));
    } else {
      const pts: number[][] = [];
      let tries = 0;
      while (pts.length < 7 && tries++ < 4000) {
        const x = x0 + 10 + rand() * (w - 20), y = y0 + 10 + rand() * (h - 20);
        if (pts.every(([a, b]) => Math.hypot(a - x, b - y) > 26)) pts.push([x, y]);
      }
      pts.forEach(([x, y]) => (body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${C.blue}"/>`));
    }
    body += text(x0 + w / 2, y0 + h + 22, `Schéma ${String.fromCharCode(65 + k)}`, { size: 14, weight: 600 });
  });
  return wrap(W, H, body, title);
}

// ---------- Urne ----------
export function urn(balls: { color: string; fill: string; n: number }[], title: string) {
  const all: string[] = [];
  balls.forEach((b) => { for (let i = 0; i < b.n; i++) all.push(b.fill); });
  const per = 6, rows = Math.ceil(all.length / per);
  const W = 300, H = 70 + rows * 34;
  let body = `<path d="M60,30 Q50,${H - 10} 150,${H - 10} Q250,${H - 10} 240,30" fill="#f1f5f9" stroke="${C.axis}" stroke-width="2"/>`;
  all.forEach((f, i) => {
    const row = Math.floor(i / per), col = i % per;
    const n = Math.min(per, all.length - row * per);
    body += `<circle cx="${150 - ((n - 1) * 30) / 2 + col * 30}" cy="${H - 32 - row * 32}" r="13" fill="${f}" stroke="#0f172a33"/>`;
  });
  return wrap(W, H, body, title);
}

// ---------- Réfraction ----------
export function refraction(i1Deg: number, i2Deg: number, n1: string, n2: string, title: string) {
  const W = 360, H = 280, cx = 180, cy = 140, L = 120;
  const a1 = (i1Deg * Math.PI) / 180, a2 = (i2Deg * Math.PI) / 180;
  let body = `<rect x="0" y="${cy}" width="${W}" height="${H - cy}" fill="#e0f2fe"/>`;
  body += `<line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="${C.axis}" stroke-width="2"/>`;
  body += `<line x1="${cx}" y1="10" x2="${cx}" y2="${H - 10}" stroke="${C.axis}" stroke-dasharray="6 5"/>`;
  body += text(cx + 6, 18, "normale", { size: 11, anchor: "start", color: C.axis });
  body += `<line x1="${cx - L * Math.sin(a1)}" y1="${cy - L * Math.cos(a1)}" x2="${cx}" y2="${cy}" stroke="${C.red}" stroke-width="2.5"/>`;
  body += `<line x1="${cx}" y1="${cy}" x2="${cx + L * Math.sin(a2)}" y2="${cy + L * Math.cos(a2)}" stroke="${C.red}" stroke-width="2.5"/>`;
  body += `<path d="M${cx},${cy - 40} A40 40 0 0 0 ${cx - 40 * Math.sin(a1)},${cy - 40 * Math.cos(a1)}" fill="none" stroke="${C.orange}" stroke-width="2"/>` + text(cx - 26, cy - 58, "i₁", { size: 14, color: C.orange, weight: 600 });
  body += `<path d="M${cx},${cy + 44} A44 44 0 0 0 ${cx + 44 * Math.sin(a2)},${cy + 44 * Math.cos(a2)}" fill="none" stroke="${C.violet}" stroke-width="2"/>` + text(cx + 22, cy + 62, "i₂", { size: 14, color: C.violet, weight: 600 });
  body += text(16, cy - 16, n1, { size: 13, anchor: "start" }) + text(16, cy + 18, n2, { size: 13, anchor: "start" });
  return wrap(W, H, body, title);
}

export function barChart(labels: string[], values: number[], title: string, yName: string) {
  const W = 420, H = 260, L = 44, B = 40, T = 16, R = 10;
  const max = Math.max(...values) * 1.15;
  const bw = (W - L - R) / labels.length;
  let body = "";
  const step = max > 20 ? 5 : max > 8 ? 2 : 1;
  for (let y = 0; y <= max; y += step) {
    const yy = H - B - (y / max) * (H - B - T);
    body += `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="${C.grid}"/>` + text(L - 6, yy, String(y), { size: 11, anchor: "end", color: C.axis });
  }
  labels.forEach((lab, i) => {
    const h = (values[i] / max) * (H - B - T);
    body += `<rect x="${L + i * bw + bw * 0.18}" y="${H - B - h}" width="${bw * 0.64}" height="${h}" rx="3" fill="${C.blue}"/>` + text(L + i * bw + bw / 2, H - B + 16, lab, { size: 12 });
  });
  body += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="${C.axis}" stroke-width="1.5"/>` + text(L, T - 4, yName, { size: 11, anchor: "start", color: C.axis, italic: true });
  return wrap(W, H, body, title);
}
