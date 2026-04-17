/**
 * Pure math utilities for computing SVG paths for each chart variant.
 * No D3 — just geometry.
 */

import type { DataPoint } from './chartData';

// ─── Layout constants ──────────────────────────────────────────────────────────

export const CHART_W = 640;
export const CHART_H = 280;
export const PAD_L   = 40;
export const PAD_R   = 20;
export const PAD_T   = 20;
export const PAD_B   = 36;

const INNER_W = CHART_W - PAD_L - PAD_R;
const INNER_H = CHART_H - PAD_T - PAD_B;

export const CX = CHART_W / 2;   // radial center x
export const CY = CHART_H / 2;   // radial center y

// ─── Coordinate helpers ────────────────────────────────────────────────────────

export interface Point2D {
  x: number;
  y: number;
}

/** Map a DataPoint value (0–100) to a pixel x position in the chart */
export function toX(index: number, total: number): number {
  const step = INNER_W / (total - 1 || 1);
  return PAD_L + index * step;
}

/** Map a DataPoint value (0–100) to a pixel y position in the chart */
export function toY(value: number): number {
  return PAD_T + INNER_H - (value / 100) * INNER_H;
}

/** Scatter — each point gets a deterministic spread position */
export function toScatterXY(index: number, value: number, total: number): Point2D {
  // Deterministic "random"-looking spread using golden angle
  const angle = index * 2.399;   // golden angle ≈ 2.399 radians
  const radius = 30 + (value / 100) * (Math.min(INNER_W, INNER_H) * 0.38);
  return {
    x: CX + Math.cos(angle) * (radius * 0.9 * (index % 2 === 0 ? 1 : -0.7)),
    y: CY + Math.sin(angle) * radius,
  };
}

/** Radial — arc positions for donut slices */
export function toRadialAngles(points: DataPoint[]): Array<{ startAngle: number; endAngle: number; cx: number; cy: number }> {
  const total = points.reduce((s, p) => s + p.value, 0);
  let cursor = -Math.PI / 2;   // start at 12 o'clock
  return points.map(p => {
    const sweep = (p.value / total) * Math.PI * 2;
    const start = cursor;
    const end   = cursor + sweep;
    const mid   = start + sweep / 2;
    const labelR = 90;
    cursor = end;
    return {
      startAngle: start,
      endAngle:   end,
      cx: CX + Math.cos(mid) * labelR,
      cy: CY + Math.sin(mid) * labelR,
    };
  });
}

// ─── Bar chart ─────────────────────────────────────────────────────────────────

export interface BarGeom {
  x: number;      // left edge of bar
  y: number;      // top of bar
  width: number;
  height: number;
  labelX: number;
  labelY: number;
  dotX: number;   // center x (for transition to dots)
  dotY: number;   // center y (for transition)
}

export function computeBars(points: DataPoint[]): BarGeom[] {
  const n = points.length;
  const barW = (INNER_W / n) * 0.55;
  const gap  = INNER_W / n;

  return points.map((p, i) => {
    const cx = PAD_L + gap * i + gap / 2;
    const h  = (p.value / 100) * INNER_H;
    const y  = PAD_T + INNER_H - h;
    return {
      x:      cx - barW / 2,
      y,
      width:  barW,
      height: h,
      labelX: cx,
      labelY: PAD_T + INNER_H + 14,
      dotX:   cx,
      dotY:   y,
    };
  });
}

// ─── Line chart ────────────────────────────────────────────────────────────────

export interface LineGeom {
  points: Point2D[];
  path: string;         // "M x y L x y …"
  totalLength: number;  // approx for dashoffset animation
}

export function computeLine(points: DataPoint[]): LineGeom {
  const n = points.length;
  const pts: Point2D[] = points.map((p, i) => ({
    x: toX(i, n),
    y: toY(p.value),
  }));

  // Smooth catmull-rom through control points
  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.4;
    const cp1y = pts[i - 1].y;
    const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) * 0.4;
    const cp2y = pts[i].y;
    path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${pts[i].x} ${pts[i].y}`;
  }

  // Approx path length for stroke-dashoffset
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }

  return { points: pts, path, totalLength: Math.round(len * 1.15) };
}

// ─── Scatter chart ─────────────────────────────────────────────────────────────

export interface ScatterGeom {
  points: Point2D[];
}

export function computeScatter(points: DataPoint[]): ScatterGeom {
  return {
    points: points.map((p, i) => toScatterXY(i, p.value, points.length)),
  };
}

// ─── Radial / donut chart ──────────────────────────────────────────────────────

export interface RadialSlice {
  path: string;
  labelX: number;
  labelY: number;
  midX: number;    // midpoint of arc outer edge
  midY: number;
  startAngle: number;
  endAngle: number;
}

export function computeRadial(points: DataPoint[]): RadialSlice[] {
  const outerR = 100;
  const innerR = 52;
  const arcs   = toRadialAngles(points);

  return arcs.map(({ startAngle, endAngle, cx: lx, cy: ly }, i) => {
    const x1 = CX + Math.cos(startAngle) * outerR;
    const y1 = CY + Math.sin(startAngle) * outerR;
    const x2 = CX + Math.cos(endAngle)   * outerR;
    const y2 = CY + Math.sin(endAngle)   * outerR;
    const ix1 = CX + Math.cos(endAngle)   * innerR;
    const iy1 = CY + Math.sin(endAngle)   * innerR;
    const ix2 = CX + Math.cos(startAngle) * innerR;
    const iy2 = CY + Math.sin(startAngle) * innerR;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;

    const midA = (startAngle + endAngle) / 2;
    const midR = (outerR + innerR) / 2;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    return {
      path,
      labelX: lx,
      labelY: ly,
      midX: CX + Math.cos(midA) * midR,
      midY: CY + Math.sin(midA) * midR,
      startAngle,
      endAngle,
    };
  });
}

// ─── Axis grid lines ───────────────────────────────────────────────────────────

export function computeGridLines(count = 5): Array<{ y: number; label: string }> {
  return Array.from({ length: count }, (_, i) => {
    const frac = i / (count - 1);
    return {
      y: PAD_T + INNER_H * (1 - frac),
      label: `${Math.round(frac * 100)}`,
    };
  });
}
