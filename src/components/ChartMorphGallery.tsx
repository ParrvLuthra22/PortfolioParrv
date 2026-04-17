'use client';

import {
  useEffect, useRef, useState, useCallback, useMemo, useId,
} from 'react';
import anime from 'animejs';
import { CHART_DATASETS, type ChartType } from '@/data/chartData';
import {
  CHART_W, CHART_H, PAD_L, PAD_B, PAD_T,
  computeBars, computeLine, computeScatter, computeRadial, computeGridLines,
} from '@/data/chartUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const CHART_TYPES: ChartType[] = ['bar', 'line', 'scatter', 'radial'];
const IDLE_DELAY = 4000;
const MORPH_DURATION = 600;

// ─── Sub-component: ProjectCard ───────────────────────────────────────────────

function ProjectCard({ idx, active }: { idx: number; active: boolean }) {
  const proj = CHART_DATASETS[idx].project;
  const ds   = CHART_DATASETS[idx];
  const cardRef = useRef<HTMLDivElement>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    if (!cardRef.current) return;
    if (active && !wasActive.current) {
      wasActive.current = true;
      anime({
        targets: cardRef.current,
        translateY: [40, 0],
        opacity: [0, 1],
        clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
        duration: 600,
        easing: 'easeOutExpo',
        delay: MORPH_DURATION + 80,
      });
    } else if (!active) {
      wasActive.current = false;
      anime({
        targets: cardRef.current,
        opacity: [1, 0],
        translateY: [0, 12],
        duration: 250,
        easing: 'easeInExpo',
      });
    }
  }, [active]);

  return (
    <div
      ref={cardRef}
      style={{
        opacity: active ? undefined : 0,
        border: `1px solid ${ds.color}33`,
        background: `linear-gradient(135deg, ${ds.gradient[0]} 0%, ${ds.gradient[1]} 100%)`,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        clipPath: active ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
      }}
    >
      {/* Gradient thumbnail strip */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${ds.color}, ${ds.accentColor})`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, letterSpacing: 2, color: ds.color,
            textTransform: 'uppercase', marginBottom: 4,
          }}>
            {ds.type} chart · {CHART_DATASETS[idx].pillLabel}
          </div>
          <h3 style={{
            fontSize: 'clamp(1rem,1.5vw,1.3rem)',
            fontWeight: 500, letterSpacing: '-0.01em',
            color: '#fff', lineHeight: 1.1,
          }}>
            {proj.name}
          </h3>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 1,
          }}>
            {proj.date}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
          <a href={proj.github} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1, color: ds.color, textDecoration: 'none', textTransform: 'uppercase' }}>
            GitHub ↗
          </a>
          <a href={proj.demo} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', textTransform: 'uppercase' }}>
            Demo ↗
          </a>
        </div>
      </div>

      <p style={{
        fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 12, maxWidth: 520,
      }}>
        {proj.description}
      </p>

      {/* Stats row — data points as highlights */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {CHART_DATASETS[idx].points.map((pt, pi) => (
          <div
            key={pi}
            data-point-id={`stat-${idx}-${pi}`}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, padding: '3px 8px',
              border: `1px solid ${ds.color}44`,
              color: ds.color,
              letterSpacing: 0.5,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: 4 }}>{pt.label}</span>
            {pt.raw}
          </div>
        ))}
      </div>

      {/* Tech tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {proj.tech.map((t, ti) => (
          <span key={ti} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 7, letterSpacing: 1,
            padding: '2px 7px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
          }}>{t}</span>
        ))}
      </div>

      {/* Highlights */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {proj.highlights.map((h, hi) => (
          <li key={hi} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6, marginBottom: 4,
          }}>
            <span style={{ color: ds.color, flexShrink: 0, marginTop: 2 }}>→</span>
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChartMorphGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef  = useRef<SVGSVGElement>(null);
  const breathRef = useRef<ReturnType<typeof anime> | null>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveId  = useId();

  // Pre-compute all geometries on mount (pure math, no D3)
  const allGeoms = useMemo(() => CHART_DATASETS.map(ds => ({
    bars:    computeBars(ds.points),
    line:    computeLine(ds.points),
    scatter: computeScatter(ds.points),
    radial:  computeRadial(ds.points),
    grid:    computeGridLines(5),
  })), []);

  const activeType  = CHART_DATASETS[activeIdx].type;
  const activeColor = CHART_DATASETS[activeIdx].color;
  const activeGeom  = allGeoms[activeIdx];

  // ── Breathing animation ──────────────────────────────────────────────────
  const startBreathing = useCallback(() => {
    if (!svgRef.current || prefersReducedMotion()) return;
    breathRef.current?.pause();
    breathRef.current = anime({
      targets: svgRef.current,
      scale: [0.995, 1.005],
      duration: 3000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    });
  }, []);

  const stopBreathing = useCallback(() => {
    breathRef.current?.pause();
    if (svgRef.current) {
      anime({ targets: svgRef.current, scale: 1, duration: 300, easing: 'easeOutExpo' });
    }
  }, []);

  // ── Entrance bar animation on mount ─────────────────────────────────────
  useEffect(() => {
    const barEls = svgRef.current?.querySelectorAll('.bar-rect');
    if (!barEls?.length) return;
    anime({
      targets: Array.from(barEls),
      scaleY: [0, 1],
      opacity: [0, 1],
      easing: 'easeOutElastic(1, .6)',
      duration: 700,
      delay: anime.stagger(40),
      complete: startBreathing,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Idle auto-cycle ──────────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      setActiveIdx(prev => (prev + 1) % CHART_TYPES.length);
    }, IDLE_DELAY);
  }, []);

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleRef.current) clearTimeout(idleRef.current); };
  }, [activeIdx, resetIdleTimer]);

  // ── Highlight stat on data-point hover ──────────────────────────────────
  const handleDotHover = useCallback((pointIdx: number | null) => {
    const els = document.querySelectorAll(`[data-point-id^="stat-${activeIdx}-"]`);
    els.forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      if (pointIdx === null || i !== pointIdx) {
        htmlEl.style.background = 'transparent';
        htmlEl.style.borderColor = `${activeColor}44`;
      } else {
        htmlEl.style.background = `${activeColor}22`;
        htmlEl.style.borderColor = activeColor;
      }
    });
  }, [activeIdx, activeColor]);

  // ── Morph transition ─────────────────────────────────────────────────────
  const morphTo = useCallback((newIdx: number) => {
    if (newIdx === activeIdx || isAnimating) return;
    if (idleRef.current) clearTimeout(idleRef.current);
    setIsAnimating(true);
    stopBreathing();

    const fast = prefersReducedMotion();
    const dur  = fast ? 0 : MORPH_DURATION;

    // Phase 1: fade out current chart elements
    const currentEls = svgRef.current?.querySelectorAll('.morphable');
    if (currentEls?.length && !fast) {
      anime({
        targets: Array.from(currentEls),
        opacity: [1, 0],
        scale: [1, 0.92],
        duration: dur / 2,
        easing: 'easeInQuint',
      });
    } else if (currentEls?.length) {
      currentEls.forEach(el => { (el as SVGElement).style.opacity = '0'; });
    }

    setTimeout(() => {
      setActiveIdx(newIdx);
      setIsAnimating(false);

      // Phase 2: animate in new chart elements (after React re-render)
      setTimeout(() => {
        const newType = CHART_DATASETS[newIdx].type;
        const newGeom = allGeoms[newIdx];

        if (fast) {
          const els = svgRef.current?.querySelectorAll('.morphable');
          els?.forEach(el => { (el as SVGElement).style.opacity = '1'; });
          startBreathing();
          resetIdleTimer();
          return;
        }

        if (newType === 'bar') {
          anime({
            targets: svgRef.current?.querySelectorAll('.bar-rect') ?? [],
            scaleY: [0, 1],
            opacity: [0, 1],
            easing: 'easeOutElastic(1, .6)',
            duration: dur,
            delay: anime.stagger(40),
          });
        } else if (newType === 'line') {
          const totalLen = newGeom.line.totalLength;
          const pathEl = svgRef.current?.querySelector('.line-path');
          if (pathEl) {
            anime({
              targets: pathEl,
              strokeDashoffset: [totalLen, 0],
              opacity: [0, 1],
              duration: dur * 1.1,
              easing: 'easeInOutQuint',
            });
          }
          anime({
            targets: svgRef.current?.querySelectorAll('.line-dot') ?? [],
            scale: [0, 1],
            opacity: [0, 1],
            duration: dur * 0.6,
            delay: anime.stagger(60, { start: dur * 0.4 }),
            easing: 'easeOutBack',
          });
        } else if (newType === 'scatter') {
          anime({
            targets: svgRef.current?.querySelectorAll('.scatter-dot') ?? [],
            opacity: [0, 1],
            scale: [0, 1],
            duration: dur * 0.7,
            delay: anime.stagger(50),
            easing: 'easeOutBack',
          });
        } else if (newType === 'radial') {
          const sliceEls = svgRef.current?.querySelectorAll('.radial-slice') ?? [];
          anime({
            targets: Array.from(sliceEls),
            opacity: [0, 1],
            scale: [0.6, 1],
            duration: dur,
            delay: anime.stagger(60),
            easing: 'easeOutExpo',
          });
        }

        // Count-up label animation
        const labelEls = svgRef.current?.querySelectorAll('.value-label') ?? [];
        labelEls.forEach((el) => {
          const end = parseInt((el as SVGTextElement).getAttribute('data-value') ?? '0', 10);
          const obj = { val: 0 };
          anime({
            targets: obj,
            val: end,
            duration: dur * 0.9,
            easing: 'easeOutExpo',
            update: () => { (el as SVGTextElement).textContent = Math.round(obj.val).toString(); },
          });
        });

        startBreathing();
        resetIdleTimer();
      }, 60); // small delay for React to re-render DOM with new chart type
    }, fast ? 0 : dur / 2 + 20);
  }, [activeIdx, allGeoms, isAnimating, resetIdleTimer, startBreathing, stopBreathing]);

  // ── Render chart elements based on active type ────────────────────────────

  const ds    = CHART_DATASETS[activeIdx];

  return (
    <div className="chart-gallery-root relative">
      {/* ARIA live region */}
      <div
        id={liveId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {`Now showing ${ds.pillLabel} chart for ${ds.project.name}`}
      </div>

      {/* ── Chart pill navigation ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {CHART_DATASETS.map((d, i) => (
          <button
            key={d.type}
            onClick={() => { morphTo(i); resetIdleTimer(); }}
            aria-pressed={activeIdx === i}
            aria-label={`Switch to ${d.pillLabel} chart`}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
              padding: '5px 14px',
              border: `1px solid ${activeIdx === i ? d.color : 'rgba(255,255,255,0.1)'}`,
              background: activeIdx === i ? `${d.color}18` : 'transparent',
              color: activeIdx === i ? d.color : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'border-color 0.25s, color 0.25s, background 0.25s',
              position: 'relative',
            }}
          >
            {d.pillLabel}
            {/* Active dot */}
            {activeIdx === i && (
              <span style={{
                position: 'absolute', top: 4, right: 5,
                width: 4, height: 4, borderRadius: '50%',
                background: d.color,
                boxShadow: `0 0 5px ${d.color}`,
                animation: 'pulse-subtle 2s ease-in-out infinite',
              }} />
            )}
          </button>
        ))}

        {/* idle hint */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8, letterSpacing: 1,
          color: 'rgba(255,255,255,0.15)',
          marginLeft: 'auto', alignSelf: 'center',
          textTransform: 'uppercase',
        }}>
          Auto-cycles · hover to pause
        </span>
      </div>

      {/* ── SVG Chart Canvas ──────────────────────────────────────────────── */}
      <div
        style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
        onMouseEnter={() => { if (idleRef.current) clearTimeout(idleRef.current); stopBreathing(); }}
        onMouseLeave={() => { resetIdleTimer(); startBreathing(); }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width="100%"
          style={{ display: 'block', transformOrigin: 'center center' }}
          aria-label={`${ds.pillLabel} data visualization`}
          role="img"
        >
          <defs>
            <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow-sm" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {activeType !== 'radial' && activeGeom.grid.map((g, gi) => (
            <g key={gi}>
              <line
                x1={PAD_L} y1={g.y} x2={CHART_W - 20} y2={g.y}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1}
              />
              <text
                x={PAD_L - 6} y={g.y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.2)"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={8}
              >
                {g.label}
              </text>
            </g>
          ))}

          {/* X axis */}
          {activeType !== 'radial' && (
            <line
              x1={PAD_L} y1={CHART_H - PAD_B} x2={CHART_W - 20} y2={CHART_H - PAD_B}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1}
            />
          )}

          {/* ── BAR CHART ─────────────────────────────────────────────── */}
          {activeType === 'bar' && activeGeom.bars.map((b, bi) => (
            <g key={bi} className="morphable">
              <rect
                className="bar-rect morphable"
                x={b.x} y={b.y}
                width={b.width}
                height={b.height}
                fill="url(#bar-grad)"
                style={{ transformOrigin: `${b.x + b.width / 2}px ${CHART_H - PAD_B}px` }}
                onMouseEnter={() => handleDotHover(bi)}
                onMouseLeave={() => handleDotHover(null)}
                aria-label={`${ds.points[bi].label}: ${ds.points[bi].raw}`}
              />
              {/* Top glow line */}
              <line
                x1={b.x} y1={b.y} x2={b.x + b.width} y2={b.y}
                stroke={activeColor} strokeWidth={1.5} opacity={0.8}
              />
              {/* X label */}
              <text
                x={b.labelX} y={b.labelY}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={8}
              >
                {ds.points[bi].label}
              </text>
              {/* Value label */}
              <text
                className="value-label"
                x={b.dotX} y={b.y - 6}
                textAnchor="middle"
                fill={activeColor}
                fontFamily="'JetBrains Mono', monospace"
                fontSize={8}
                data-value={ds.points[bi].value}
              >
                {ds.points[bi].value}
              </text>
            </g>
          ))}

          {/* ── LINE CHART ──────────────────────────────────────────────── */}
          {activeType === 'line' && (() => {
            const totalLen = activeGeom.line.totalLength;
            return (
              <>
                {/* Area fill */}
                <path
                  className="morphable"
                  d={activeGeom.line.path + ` L ${activeGeom.line.points[activeGeom.line.points.length - 1].x} ${CHART_H - PAD_B} L ${PAD_L} ${CHART_H - PAD_B} Z`}
                  fill={`${activeColor}14`}
                  stroke="none"
                />
                {/* Line stroke */}
                <path
                  className="line-path morphable"
                  d={activeGeom.line.path}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={2}
                  strokeDasharray={totalLen}
                  strokeDashoffset={totalLen}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots + labels */}
                {activeGeom.line.points.map((pt, pi) => (
                  <g key={pi} className="morphable">
                    <circle
                      className="line-dot"
                      cx={pt.x} cy={pt.y} r={5}
                      fill={activeColor}
                      filter="url(#glow-sm)"
                      style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                      onMouseEnter={() => handleDotHover(pi)}
                      onMouseLeave={() => handleDotHover(null)}
                      aria-label={`${ds.points[pi].label}: ${ds.points[pi].raw}`}
                    />
                    <text
                      className="value-label"
                      x={pt.x} y={pt.y - 10}
                      textAnchor="middle"
                      fill={activeColor}
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize={8}
                      data-value={ds.points[pi].value}
                    >
                      {ds.points[pi].value}
                    </text>
                    <text
                      x={pt.x} y={CHART_H - PAD_B + 14}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.4)"
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize={8}
                    >
                      {ds.points[pi].label}
                    </text>
                  </g>
                ))}
              </>
            );
          })()}

          {/* ── SCATTER CHART ────────────────────────────────────────────── */}
          {activeType === 'scatter' && activeGeom.scatter.points.map((pt, pi) => (
            <g key={pi} className="morphable" style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}>
              {/* Outer ring */}
              <circle
                cx={pt.x} cy={pt.y}
                r={10 + (ds.points[pi].value / 100) * 8}
                fill={`${activeColor}14`}
                stroke={`${activeColor}44`}
                strokeWidth={1}
              />
              <circle
                className="scatter-dot"
                cx={pt.x} cy={pt.y} r={6}
                fill={activeColor}
                filter="url(#glow-sm)"
                style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                onMouseEnter={() => handleDotHover(pi)}
                onMouseLeave={() => handleDotHover(null)}
                aria-label={`${ds.points[pi].label}: ${ds.points[pi].raw}`}
              />
              <text
                className="value-label"
                x={pt.x} y={pt.y - 18}
                textAnchor="middle"
                fill={activeColor}
                fontFamily="'JetBrains Mono', monospace"
                fontSize={8}
                fontWeight={600}
                data-value={ds.points[pi].value}
              >
                {ds.points[pi].value}
              </text>
              <text
                x={pt.x} y={pt.y + 22}
                textAnchor="middle"
                fill="rgba(255,255,255,0.35)"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={7}
              >
                {ds.points[pi].label}
              </text>
            </g>
          ))}

          {/* ── RADIAL / DONUT CHART ─────────────────────────────────────── */}
          {activeType === 'radial' && (() => {
            const PALETTE = ['#FF8FA3', '#FFAAB8', '#FFB8C6', '#FFC5D0', '#FFD0DA'];
            return (
              <>
                {activeGeom.radial.map((slice, si) => (
                  <g key={si}>
                    {/* Slice */}
                    <path
                      className="radial-slice morphable"
                      d={slice.path}
                      fill={si === 0 ? activeColor : (PALETTE[si] ?? activeColor)}
                      fillOpacity={0.85 - si * 0.12}
                      stroke="rgba(0,0,0,0.6)"
                      strokeWidth={2}
                      style={{ transformOrigin: `${CHART_W / 2}px ${CHART_H / 2}px` }}
                      onMouseEnter={() => handleDotHover(si)}
                      onMouseLeave={() => handleDotHover(null)}
                      aria-label={`${ds.points[si].label}: ${ds.points[si].raw}`}
                    />
                    {/* Label */}
                    <text
                      className="value-label"
                      x={slice.labelX} y={slice.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={si === 0 ? activeColor : (PALETTE[si] ?? activeColor)}
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize={8}
                      fontWeight={600}
                      data-value={ds.points[si].value}
                    >
                      {ds.points[si].value}%
                    </text>
                    <text
                      x={slice.labelX} y={slice.labelY + 11}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.3)"
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize={7}
                    >
                      {ds.points[si].label}
                    </text>
                  </g>
                ))}
                {/* Center hole label */}
                <circle cx={CHART_W / 2} cy={CHART_H / 2} r={48} fill="rgba(4,4,4,0.92)" />
                <text
                  x={CHART_W / 2} y={CHART_H / 2 - 6}
                  textAnchor="middle"
                  fill={activeColor}
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={11} fontWeight={700}
                >
                  {ds.points.reduce((s, p) => s + p.value, 0)}%
                </text>
                <text
                  x={CHART_W / 2} y={CHART_H / 2 + 9}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.3)"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={7}
                >
                  Breakdown
                </text>
              </>
            );
          })()}

          {/* Chart type label watermark */}
          <text
            x={CHART_W - 20} y={PAD_T + 4}
            textAnchor="end"
            fill={`${activeColor}33`}
            fontFamily="'JetBrains Mono', monospace"
            fontSize={9} letterSpacing={2}
            style={{ textTransform: 'uppercase' }}
          >
            {ds.pillLabel} Chart
          </text>
        </svg>
      </div>

      {/* ── Project Cards (one per dataset, only active is revealed) ──── */}
      <div style={{ marginTop: 20, position: 'relative', minHeight: 180 }}>
        {CHART_DATASETS.map((_, i) => (
          <div key={i} style={{ position: i === 0 ? 'relative' : 'absolute', top: 0, left: 0, right: 0, pointerEvents: activeIdx === i ? 'auto' : 'none' }}>
            <ProjectCard idx={i} active={activeIdx === i} />
          </div>
        ))}
      </div>
    </div>
  );
}
