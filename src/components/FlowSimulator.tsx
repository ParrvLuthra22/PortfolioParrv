'use client';

import { useEffect, useRef, useReducer, useCallback, useState, forwardRef, type MutableRefObject } from 'react';
import anime from 'animejs';
import {
  NODES,
  PATHS,
  FLOW_CONFIG,
  PACKET_TYPES,
  MOCK_ENDPOINTS,
  SVG_WIDTH,
  SVG_HEIGHT,
  type PacketState,
  type NodeId,
  type PacketType,
} from '@/data/architectureNodes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _packetCounter = 0;
function uid() { return `pkt-${++_packetCounter}`; }

function pickPacketType(): PacketType {
  const r = Math.random();
  let acc = 0;
  for (const t of PACKET_TYPES) {
    acc += t.weight;
    if (r < acc) return t.type;
  }
  return 'get';
}

function packetColor(type: PacketType): string {
  return PACKET_TYPES.find(t => t.type === type)?.color ?? '#D4A030';
}

function sampleEndpoint() {
  return MOCK_ENDPOINTS[Math.floor(Math.random() * MOCK_ENDPOINTS.length)];
}

/** Evaluate a point on the cubic bezier path at t ∈ [0,1] */
function evalCubicBezier(
  p0x: number, p0y: number,
  p1x: number, p1y: number,
  p2x: number, p2y: number,
  p3x: number, p3y: number,
  t: number
): [number, number] {
  const mt = 1 - t;
  const x = mt * mt * mt * p0x + 3 * mt * mt * t * p1x + 3 * mt * t * t * p2x + t * t * t * p3x;
  const y = mt * mt * mt * p0y + 3 * mt * mt * t * p1y + 3 * mt * t * t * p2y + t * t * t * p3y;
  return [x, y];
}

/** Parse "M x0 y0 C cx1 cy1, cx2 cy2, x3 y3" and sample at t */
function samplePath(d: string, t: number): [number, number] {
  const parts = d.replace(/[MCL,]/g, ' ').trim().split(/\s+/).map(Number);
  // Format: M p0x p0y C p1x p1y p2x p2y p3x p3y
  const [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y] = [
    parts[0], parts[1],
    parts[2], parts[3],
    parts[4], parts[5],
    parts[6], parts[7],
  ];
  return evalCubicBezier(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t);
}

// ─── State / Reducer ──────────────────────────────────────────────────────────

interface SimState {
  packets: PacketState[];
  selectedNode: NodeId | null;
  hoveredPacketId: string | null;
  paused: boolean;
}

type SimAction =
  | { type: 'SPAWN'; packet: PacketState }
  | { type: 'TICK' }
  | { type: 'REMOVE'; id: string }
  | { type: 'SELECT_NODE'; id: NodeId | null }
  | { type: 'HOVER_PACKET'; id: string | null };

function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'SPAWN':
      if (state.packets.length >= FLOW_CONFIG.maxPackets) return state;
      return { ...state, packets: [...state.packets, action.packet] };

    case 'TICK': {
      if (state.paused) return state;
      const updated: PacketState[] = [];
      const toRemove: string[] = [];

      for (const pkt of state.packets) {
        const newProgress = pkt.progress + FLOW_CONFIG.packetSpeed;
        if (newProgress >= 1) {
          if (!pkt.isReturn && pkt.pathIndex < PATHS.length - 1) {
            // Advance to next path segment
            const nextPath = PATHS[pkt.pathIndex + 1];
            const [nx, ny] = samplePath(nextPath.d, 0);
            updated.push({ ...pkt, pathIndex: pkt.pathIndex + 1, progress: 0, x: nx, y: ny });
          } else if (!pkt.isReturn) {
            // Reached DB — spawn return packet traveling backwards
            const returnPathIdx = PATHS.length - 1;
            const returnPath = PATHS[returnPathIdx];
            const [rx, ry] = samplePath(returnPath.d, 1);
            const returnPkt: PacketState = {
              ...pkt,
              id: uid(),
              isReturn: true,
              opacity: 0.45,
              pathIndex: returnPathIdx,
              progress: 0, // 0 means start of reverse journey (t=1 on the path)
              x: rx,
              y: ry,
            };
            updated.push(returnPkt);
            toRemove.push(pkt.id);
          } else {
            // Return packet fully traveled — remove
            toRemove.push(pkt.id);
          }
        } else {
          const path = PATHS[pkt.pathIndex];
          const t = pkt.isReturn ? 1 - newProgress : newProgress;
          const [x, y] = samplePath(path.d, t);
          updated.push({ ...pkt, progress: newProgress, x, y });
        }
      }

      return {
        ...state,
        packets: updated.filter(p => !toRemove.includes(p.id)),
      };
    }

    case 'REMOVE':
      return { ...state, packets: state.packets.filter(p => p.id !== action.id) };

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNode: action.id,
        paused: action.id !== null,
      };

    case 'HOVER_PACKET':
      return {
        ...state,
        hoveredPacketId: action.id,
        paused: action.id !== null,
      };

    default:
      return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FlowSimulator() {
  const [state, dispatch] = useReducer(simReducer, {
    packets: [],
    selectedNode: null,
    hoveredPacketId: null,
    paused: false,
  });

  const rafRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nodeRefsMap = useRef<Map<NodeId, SVGGElement>>(new Map());
  const pathRefsMap = useRef<Map<string, SVGPathElement>>(new Map());
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // ── Tick loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 16) { // ~60fps
        dispatch({ type: 'TICK' });
        last = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Spawn loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const spawn = () => {
      if (state.paused) return;
      const type = pickPacketType();
      const endpoint = sampleEndpoint();
      const firstPath = PATHS[0];
      const [sx, sy] = samplePath(firstPath.d, 0);
      dispatch({
        type: 'SPAWN',
        packet: {
          id: uid(),
          type,
          pathIndex: 0,
          progress: 0,
          label: `${endpoint.method} ${endpoint.path}`,
          method: endpoint.method,
          endpoint: endpoint.path,
          statusCode: endpoint.status,
          responseTime: endpoint.time,
          isReturn: false,
          x: sx,
          y: sy,
          opacity: 1,
        },
      });
    };
    spawnTimerRef.current = setInterval(spawn, FLOW_CONFIG.spawnInterval);
    return () => { if (spawnTimerRef.current) clearInterval(spawnTimerRef.current); };
  }, [state.paused]);

  // ── Path dash-offset pulse ───────────────────────────────────────────────
  useEffect(() => {
    const targets = Array.from(pathRefsMap.current.values());
    if (!targets.length) return;
    const anim = anime({
      targets,
      strokeDashoffset: [500, 0],
      duration: 2200,
      easing: 'linear',
      loop: true,
      delay: anime.stagger(400),
    });
    return () => anim.pause();
  }, []);

  // ── Node select animations ────────────────────────────────────────────────
  useEffect(() => {
    NODES.forEach(node => {
      const el = nodeRefsMap.current.get(node.id);
      if (!el) return;
      const isSelected = state.selectedNode === node.id;
      const isOther = state.selectedNode !== null && !isSelected;
      anime({
        targets: el,
        scale: isSelected ? 1.55 : isOther ? 0.42 : 1,
        opacity: isOther ? 0.28 : 1,
        duration: 500,
        easing: 'easeOutExpo',
      });
    });

    // Card: show on select, hide on deselect
    if (state.selectedNode) {
      setCardVisible(true); // mount the card first, then animate in via onMount
    } else if (!state.selectedNode && cardRef.current) {
      anime({
        targets: cardRef.current,
        clipPath: ['inset(0 0 0 0%)', 'inset(0 0 0 100%)'],
        opacity: [1, 0],
        duration: 350,
        easing: 'easeInExpo',
        complete: () => setCardVisible(false),
      });
    }
  }, [state.selectedNode]);

  // ── Tooltip visibility (anime-style) ─────────────────────────────────────
  useEffect(() => {
    const hoveredPkt = state.packets.find(p => p.id === state.hoveredPacketId);
    if (hoveredPkt) {
      setTooltipVisible(true);
    } else {
      setTooltipVisible(false);
    }
  }, [state.hoveredPacketId, state.packets]);

  // ── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'SELECT_NODE', id: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleNodeClick = useCallback((id: NodeId) => {
    dispatch({ type: 'SELECT_NODE', id: state.selectedNode === id ? null : id });
  }, [state.selectedNode]);

  const selectedNodeDef = NODES.find(n => n.id === state.selectedNode);
  const hoveredPkt = state.packets.find(p => p.id === state.hoveredPacketId);

  return (
    <div className="flow-simulator-root relative w-full" style={{ minHeight: 420 }}>

      {/* ── SVG Diagram ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ borderRadius: 2 }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          width="100%"
          style={{ display: 'block', maxHeight: 280, overflow: 'visible' }}
          aria-label="Live data flow architecture diagram"
        >
          <defs>
            {/* Glow filters per node */}
            {NODES.map(n => (
              <filter key={n.id} id={`glow-${n.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            {/* Packet glow */}
            <filter id="glow-packet" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Paths ───────────────────────────────────────────────────── */}
          {PATHS.map(path => (
            <g key={path.id}>
              {/* Static background track */}
              <path
                d={path.d}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={2}
              />
              {/* Animated dash-offset pulse */}
              <path
                ref={el => { if (el) pathRefsMap.current.set(path.id, el); }}
                d={path.d}
                fill="none"
                stroke="rgba(212,160,48,0.35)"
                strokeWidth={2}
                strokeDasharray="12 18"
                strokeDashoffset={500}
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* ── Nodes ───────────────────────────────────────────────────── */}
          {NODES.map(node => (
            <g
              key={node.id}
              ref={el => { if (el) nodeRefsMap.current.set(node.id, el); }}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: 'pointer', transformOrigin: `${node.cx}px ${node.cy}px`, transformBox: 'fill-box' }}
              filter={`url(#glow-${node.id})`}
              role="button"
              aria-label={`${node.label} node — click to reveal project`}
            >
              {/* Outer ring */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={34}
                fill="rgba(0,0,0,0.7)"
                stroke={node.color}
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />
              {/* Inner glow disc */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={22}
                fill={node.color}
                fillOpacity={0.12}
                stroke={node.color}
                strokeWidth={1}
                strokeOpacity={0.8}
              />
              {/* Node label */}
              <text
                x={node.cx}
                y={node.cy - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.color}
                fontFamily="'JetBrains Mono', monospace"
                fontSize={7}
                fontWeight={700}
                letterSpacing={1.5}
              >
                {node.label.split(' ').map((word, wi) => (
                  <tspan key={wi} x={node.cx} dy={wi === 0 ? 0 : 9}>{word}</tspan>
                ))}
              </text>
              {/* Sub-label below node circle */}
              <text
                x={node.cx}
                y={node.cy + 46}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={7}
                letterSpacing={0.5}
              >
                {node.sublabel}
              </text>
              {/* Click hint */}
              <text
                x={node.cx}
                y={node.cy + 57}
                textAnchor="middle"
                fill={node.color}
                fontFamily="'JetBrains Mono', monospace"
                fontSize={6}
                opacity={0.4}
              >
                [click]
              </text>
            </g>
          ))}

          {/* ── Packets ──────────────────────────────────────────────────── */}
          {state.packets.map(pkt => (
            <g
              key={pkt.id}
              style={{ cursor: 'default' }}
              onMouseEnter={() => dispatch({ type: 'HOVER_PACKET', id: pkt.id })}
              onMouseLeave={() => dispatch({ type: 'HOVER_PACKET', id: null })}
            >
              {/* Outer glow ring */}
              <circle
                cx={pkt.x}
                cy={pkt.y}
                r={state.hoveredPacketId === pkt.id ? 12 : 8}
                fill={packetColor(pkt.type)}
                opacity={pkt.opacity * 0.18}
                filter="url(#glow-packet)"
                style={{ transition: 'r 0.15s' }}
              />
              {/* Main packet circle */}
              <circle
                cx={pkt.x}
                cy={pkt.y}
                r={state.hoveredPacketId === pkt.id ? 9 : 7}
                fill={packetColor(pkt.type)}
                opacity={pkt.opacity}
                filter="url(#glow-packet)"
                style={{ transition: 'r 0.15s' }}
              />
              {/* Floating label */}
              {!pkt.isReturn && (
                <text
                  x={pkt.x}
                  y={pkt.y - 14}
                  textAnchor="middle"
                  fill={packetColor(pkt.type)}
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={6}
                  opacity={pkt.opacity * 0.8}
                >
                  {pkt.method} {pkt.endpoint.split('/').slice(0, 3).join('/')}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* ── Hovered Packet Tooltip ────────────────────────────────────── */}
        {hoveredPkt && tooltipVisible && (
          <div
            className="packet-tooltip absolute pointer-events-none z-30"
            style={{
              left: `${(hoveredPkt.x / SVG_WIDTH) * 100}%`,
              top: `${(hoveredPkt.y / SVG_HEIGHT) * 100}%`,
              transform: 'translateX(-50%) translateY(-140%)',
              animation: 'tooltipEnter 0.2s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            <div
              style={{
                background: 'rgba(10,10,10,0.95)',
                border: `1px solid ${packetColor(hoveredPkt.type)}44`,
                padding: '10px 14px',
                minWidth: 160,
                boxShadow: `0 0 20px ${packetColor(hoveredPkt.type)}22`,
              }}
            >
              <div className="text-mono" style={{ color: packetColor(hoveredPkt.type), fontSize: 8, letterSpacing: 2, marginBottom: 6 }}>
                REQUEST DETAILS
              </div>
              <div className="space-y-1" style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>METHOD </span>
                  {hoveredPkt.method}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>PATH   </span>
                  {hoveredPkt.endpoint}
                </div>
                <div style={{ color: hoveredPkt.statusCode >= 400 ? '#FF6B6B' : '#77DD77' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>STATUS </span>
                  {hoveredPkt.statusCode}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>TIME   </span>
                  {hoveredPkt.responseTime}ms
                </div>
              </div>
            </div>
            {/* Arrow */}
            <div style={{
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${packetColor(hoveredPkt.type)}44`,
              margin: '0 auto',
            }} />
          </div>
        )}
      </div>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 mt-4 mb-8" style={{ paddingLeft: 4 }}>
        {PACKET_TYPES.map(pt => (
          <div key={pt.type} className="flex items-center gap-2">
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: pt.color,
              boxShadow: `0 0 6px ${pt.color}`,
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {pt.type === 'get' ? 'GET Request' : pt.type === 'post' ? 'POST Request' : 'Error'}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <div style={{
            width: 20, height: 1,
            background: 'linear-gradient(90deg, #D4A030, transparent)',
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: 1,
          }}>CLICK NODES TO EXPLORE</span>
        </div>
      </div>

      {/* ── Project Card Panel ──────────────────────────────────────────── */}
      {cardVisible && selectedNodeDef && (
        <CardWrapper ref={cardRef} node={selectedNodeDef} onClose={() => dispatch({ type: 'SELECT_NODE', id: null })} />
      )}
    </div>
  );
}

// ─── Card Wrapper (forwardRef so parent can animate the container) ────────────

const CardWrapper = forwardRef<
  HTMLDivElement,
  { node: typeof NODES[number]; onClose: () => void }
>(function CardWrapper({ node, onClose }, ref) {
  const localRef = useRef<HTMLDivElement>(null);

  // Merge forwarded ref + local ref
  const setRef = (el: HTMLDivElement | null) => {
    (localRef as MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = el;
  };

  useEffect(() => {
    if (!localRef.current) return;
    anime({
      targets: localRef.current,
      clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutExpo',
    });
  }, []);

  return (
    <div
      ref={setRef}
      style={{ clipPath: 'inset(0 0 0 100%)', opacity: 0 }}
    >
      <ProjectCard node={node} onClose={onClose} />
    </div>
  );
});

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ node, onClose }: { node: typeof NODES[number]; onClose: () => void }) {
  const cardInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardInnerRef.current) {
      anime({
        targets: cardInnerRef.current.querySelectorAll('.card-reveal-item'),
        translateY: [24, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(60, { start: 200 }),
      });
    }
  }, []);

  const proj = node.project;

  return (
    <div
      ref={cardInnerRef}
      style={{
        border: `1px solid ${node.color}33`,
        background: 'rgba(8,8,8,0.95)',
        padding: '32px',
        position: 'relative',
        boxShadow: `0 0 40px ${node.color}12`,
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="card-reveal-item"
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, cursor: 'pointer', letterSpacing: 1,
          opacity: 0,
        }}
        aria-label="Close project card"
      >
        [ESC]
      </button>

      {/* Layer badge */}
      <div
        className="card-reveal-item"
        style={{
          opacity: 0,
          display: 'inline-block',
          padding: '3px 10px',
          border: `1px solid ${node.color}55`,
          color: node.color,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8, letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        {proj.layer}
      </div>

      {/* Title row */}
      <div className="card-reveal-item flex items-start justify-between mb-4" style={{ opacity: 0 }}>
        <div>
          <h3 style={{
            fontSize: 'clamp(1.5rem,2vw,2rem)',
            letterSpacing: '-0.02em',
            fontWeight: 500,
            color: '#fff',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            {proj.name}
          </h3>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 1,
          }}>
            {proj.date}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          <a
            href={proj.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, letterSpacing: 1,
              color: node.color, textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            GitHub ↗
          </a>
          <a
            href={proj.demo}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, letterSpacing: 1,
              color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            Demo ↗
          </a>
        </div>
      </div>

      {/* Description */}
      <p className="card-reveal-item" style={{
        opacity: 0,
        color: 'rgba(255,255,255,0.55)',
        fontSize: 'clamp(0.85rem,1vw,0.95rem)',
        lineHeight: 1.65,
        maxWidth: 560,
        marginBottom: 20,
      }}>
        {proj.description}
      </p>

      {/* Highlights */}
      <ul className="card-reveal-item" style={{ opacity: 0, marginBottom: 24, listStyle: 'none', padding: 0 }}>
        {proj.highlights.map((h, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 13, lineHeight: 1.6,
            fontFamily: 'Inter, system-ui, sans-serif',
            marginBottom: 6,
          }}>
            <span style={{ color: node.color, marginTop: 2, flexShrink: 0 }}>→</span>
            {h}
          </li>
        ))}
      </ul>

      {/* Tech stack */}
      <div className="card-reveal-item" style={{ opacity: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {proj.tech.map((t, i) => (
          <span key={i} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: 1,
            padding: '4px 10px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
