'use client';

import {
  useState, useRef, useCallback, useEffect,
  type KeyboardEvent,
} from 'react';
import anime from 'animejs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TileState {
  painted: boolean;
  x: number;  // col
  y: number;  // row
}

// ─── Frontend Projects ────────────────────────────────────────────────────────

const frontendProjects = [
  {
    name: 'GTA VI',
    date: '2025',
    github: '',
    demo: '',
    description: 'Fan-made GTA VI landing page recreation with cinematic animations and parallax effects.',
    tech: ['HTML', 'CSS', 'JavaScript', 'GSAP'],
    highlights: [
      'Cinematic hero section with layered parallax scroll',
      'GPU-accelerated animations matching the trailer aesthetic',
      'Pixel-perfect type treatment and motion design',
    ],
    gradient: 'linear-gradient(135deg, #0a0f1a 0%, #1a2a0a 40%, #2a1a0a 70%, #FF6B00 100%)',
    accentColor: '#FF6B00',
    terminalTitle: 'gta-vi-fan.vercel.app',
  },
  {
    name: 'Hoodie Branding',
    date: '2025',
    github: '',
    demo: '',
    description: 'E-commerce brand page for a hoodie label — premium dark aesthetic with 3D product views.',
    tech: ['React', 'Tailwind CSS', 'Three.js', 'Anime.js'],
    highlights: [
      '3D product viewer with mouse-driven rotation',
      'Glassmorphism cart and checkout UI',
      'Dark luxury brand aesthetic with micro-interactions',
    ],
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a1a2e 80%, #A855F7 100%)',
    accentColor: '#A855F7',
    terminalTitle: 'hoodie-brand.vercel.app',
  },
  {
    name: 'Law and Disorder',
    date: '2025',
    github: '',
    demo: '',
    description: 'Legal tech startup landing page with editorial grid layout and scroll-triggered reveals.',
    tech: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
    highlights: [
      'Editorial multi-column grid with asymmetric layout',
      'Scroll-triggered text reveals and section transitions',
      'Accessible contrast-first typography system',
    ],
    gradient: 'linear-gradient(135deg, #0a0a14 0%, #14141e 50%, #1e1e0a 80%, #E8D5A3 100%)',
    accentColor: '#E8D5A3',
    terminalTitle: 'law-disorder.vercel.app',
  },
  {
    name: 'Skin2Skin',
    date: '2025',
    github: '',
    demo: '',
    description: 'Skincare brand microsite with ingredient explorer and animated product showcase.',
    tech: ['React', 'CSS', 'Anime.js'],
    highlights: [
      'Ingredient drill-down with animated card transitions',
      'Soft pastel palette with flowing shape animations',
      'Mobile-first responsive layout with touch gestures',
    ],
    gradient: 'linear-gradient(135deg, #1a0a10 0%, #2e1020 50%, #3e1a28 80%, #F9A8C9 100%)',
    accentColor: '#F9A8C9',
    terminalTitle: 'skin2skin.vercel.app',
  },
  {
    name: 'Vizun',
    date: '2025',
    github: '',
    demo: '',
    description: 'Creative studio portfolio with fullscreen project reveals and cursor-reactive backgrounds.',
    tech: ['Next.js', 'Tailwind CSS', 'Anime.js', 'WebGL'],
    highlights: [
      'Cursor-reactive noise shader background',
      'Fullscreen project reveal with clip-path transitions',
      'Custom magnetic cursor with project color morphing',
    ],
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #0a1a1a 50%, #1a0a1a 80%, #00F5D4 100%)',
    accentColor: '#00F5D4',
    terminalTitle: 'vizun.vercel.app',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const COLS = 20;
const ROWS = 20;
const TOTAL_TILES = COLS * ROWS;
const PAINT_THRESHOLD = 0.6; // 60%

function buildInitialGrid(): TileState[] {
  const tiles: TileState[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      tiles.push({ painted: false, x: col, y: row });
    }
  }
  return tiles;
}

function tileIndex(col: number, row: number): number {
  return row * COLS + col;
}

// ─── Terminal Card ────────────────────────────────────────────────────────────

function TerminalCard({
  project,
  index,
}: {
  project: typeof frontendProjects[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const scanline = card.querySelector<HTMLDivElement>('.scanline');
    let scanAnim: ReturnType<typeof anime> | null = null;

    const onEnter = () => {
      if (!scanline) return;
      scanAnim?.pause();
      scanline.style.opacity = '1';
      scanAnim = anime({
        targets: scanline,
        translateY: ['-100%', '110%'],
        duration: 1500,
        easing: 'linear',
        loop: true,
      });
    };

    const onLeave = () => {
      scanAnim?.pause();
      if (scanline) scanline.style.opacity = '0';
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      scanAnim?.pause();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="pixel-card"
      style={{
        opacity: 0,
        transform: 'translateY(40px)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(6,6,6,0.95)',
        fontFamily: "'JetBrains Mono', monospace",
        flexShrink: 0,
        width: 'clamp(280px, 33%, 380px)',
      }}
      aria-label={`Frontend project: ${project.name}`}
    >
      {/* Scanline overlay — sweeps on hover */}
      <div
        className="scanline"
        style={{
          position: 'absolute',
          left: 0, right: 0,
          height: 40,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04), transparent)',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0,
          top: 0,
        }}
      />

      {/* Terminal title bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)',
      }}>
        {/* Traffic light dots */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28CA41' }} />
        <span style={{
          fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5,
          marginLeft: 8, flex: 1, textAlign: 'center',
        }}>
          {project.terminalTitle}
        </span>
        {/* Blinking cursor */}
        <span style={{
          display: 'inline-block',
          width: 7, height: 11,
          background: project.accentColor,
          animation: 'termCursorBlink 0.8s step-end infinite',
          verticalAlign: 'text-bottom',
          opacity: 0.9,
        }} />
      </div>

      {/* Gradient "screenshot" strip */}
      <div style={{
        height: 80,
        background: project.gradient,
        opacity: 0.7,
        position: 'relative',
      }}>
        {/* Scanline overlay on image */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 32,
          background: 'linear-gradient(to bottom, transparent, rgba(6,6,6,0.95))',
        }} />
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px 20px' }}>
        {/* Index badge */}
        <div style={{
          fontSize: 8, letterSpacing: 2,
          color: project.accentColor,
          textTransform: 'uppercase', marginBottom: 6,
        }}>
          {String(index + 1).padStart(2, '0')} / Frontend
        </div>

        <h3 style={{
          fontSize: 'clamp(1rem,1.4vw,1.3rem)',
          fontWeight: 500, letterSpacing: '-0.01em',
          color: '#fff', marginBottom: 4, lineHeight: 1.1,
        }}>
          {project.name}
        </h3>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, marginBottom: 12 }}>
          {project.date}
        </div>

        <p style={{
          fontSize: 11, lineHeight: 1.65,
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 14,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {project.description}
        </p>

        {/* Highlights */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', }}>
          {project.highlights.map((h, hi) => (
            <li key={hi} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              fontSize: 10, color: 'rgba(255,255,255,0.35)',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1.6, marginBottom: 4,
            }}>
              <span style={{ color: project.accentColor, flexShrink: 0, marginTop: 3 }}>›</span>
              {h}
            </li>
          ))}
        </ul>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
          {project.tech.map((t, ti) => (
            <span key={ti} style={{
              fontSize: 8, letterSpacing: 1,
              padding: '2px 7px',
              border: `1px solid ${project.accentColor}44`,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
            }}>{t}</span>
          ))}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 14 }}>
          <a href={project.github} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 9, letterSpacing: 1, color: project.accentColor,
            textDecoration: 'none', textTransform: 'uppercase',
          }}>$ git clone ↗</a>
          <a href={project.demo} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.3)',
            textDecoration: 'none', textTransform: 'uppercase',
          }}>→ open demo ↗</a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PixelArtBuilder() {
  const [tiles, setTiles] = useState<TileState[]>(buildInitialGrid);
  const [revealed, setRevealed] = useState(false);
  const [paintedCount, setPaintedCount] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRefsMap = useRef<(HTMLDivElement | null)[]>([]);
  const isRevealingRef = useRef(false);
  const lastPaintedTiles = useRef<Set<number>>(new Set());

  // ── Calculate grid tile from cursor position ─────────────────────────────
  const getTileAtCursor = useCallback((clientX: number, clientY: number): { col: number; row: number } | null => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return null;
    const col = Math.floor((relX / rect.width) * COLS);
    const row = Math.floor((relY / rect.height) * ROWS);
    return {
      col: Math.max(0, Math.min(COLS - 1, col)),
      row: Math.max(0, Math.min(ROWS - 1, row)),
    };
  }, []);

  // ── Paint tiles (center + neighbors radius 1) ────────────────────────────
  const paintAt = useCallback((col: number, row: number) => {
    if (isRevealingRef.current) return;

    const toUpdate: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nc = col + dc;
        const nr = row + dr;
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
        const idx = tileIndex(nc, nr);
        if (lastPaintedTiles.current.has(idx)) continue;
        toUpdate.push(idx);
      }
    }

    if (!toUpdate.length) return;
    toUpdate.forEach(idx => lastPaintedTiles.current.add(idx));

    // DOM micro-animation on individual tiles
    toUpdate.forEach(idx => {
      const el = tileRefsMap.current[idx];
      if (!el) return;
      anime({
        targets: el,
        scale: [0.85, 1.05, 1.0],
        duration: 220,
        easing: 'spring(1, 80, 14, 0)',
      });
    });

    setTiles(prev => {
      const next = [...prev];
      let newlyPainted = 0;
      toUpdate.forEach(idx => {
        if (!next[idx].painted) {
          next[idx] = { ...next[idx], painted: true };
          newlyPainted++;
        }
      });
      if (newlyPainted > 0) {
        setPaintedCount(c => {
          const newCount = c + newlyPainted;
          return newCount;
        });
      }
      return next;
    });
  }, []);

  // ── Trigger full reveal when threshold is hit ────────────────────────────
  useEffect(() => {
    if (revealed || isRevealingRef.current) return;
    if (paintedCount < TOTAL_TILES * PAINT_THRESHOLD) return;

    isRevealingRef.current = true;

    // Find all unpainted tiles
    const unpaints = tileRefsMap.current
      .map((el, idx) => ({ el, idx }))
      .filter(({ idx }) => !tiles[idx]?.painted && tileRefsMap.current[idx]);

    // Dramatic flip reveal of remaining tiles
    anime({
      targets: unpaints.map(u => u.el).filter(Boolean),
      rotateY: [0, 180],
      opacity: [1, 0],
      duration: 600,
      easing: 'easeInOutQuad',
      delay: (_el, i) => i * 15,
      complete: () => {
        setRevealed(true);
        setTiles(prev => prev.map(t => ({ ...t, painted: true })));
      },
    });

    // Also animate all tiles to full reveal opacity
    anime({
      targets: tileRefsMap.current.filter(Boolean),
      opacity: 0,
      duration: 800,
      easing: 'easeInOutQuad',
      delay: (_el, i) => i * 8,
    });
  }, [paintedCount, revealed, tiles]);

  // ── Reveal cards after tiles disappear ──────────────────────────────────
  useEffect(() => {
    if (!revealed) return;
    setTimeout(() => {
      anime({
        targets: '.pixel-card',
        translateY: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutBack',
        duration: 700,
        delay: anime.stagger(80),
      });
    }, 200);
  }, [revealed]);

  // ── Mouse handler ────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (revealed) return;
    const tile = getTileAtCursor(e.clientX, e.clientY);
    if (!tile) return;
    paintAt(tile.col, tile.row);
  }, [revealed, getTileAtCursor, paintAt]);

  // ── Keyboard handler on tile ─────────────────────────────────────────────
  const handleTileKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>, idx: number) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const tile = tiles[idx];
      paintAt(tile.x, tile.y);
    }
  }, [tiles, paintAt]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (isRevealingRef.current && !revealed) return;

    // Reverse-animate: fade tiles back in
    anime({
      targets: tileRefsMap.current.filter(Boolean),
      opacity: [0, 1],
      rotateY: [180, 0],
      scale: [0.8, 1],
      duration: 600,
      easing: 'easeOutExpo',
      delay: (_el, i) => i * 4,
      complete: () => {
        setRevealed(false);
        setTiles(buildInitialGrid());
        setPaintedCount(0);
        lastPaintedTiles.current.clear();
        isRevealingRef.current = false;
        // Reset card opacities
        anime({
          targets: '.pixel-card',
          opacity: 0,
          translateY: 40,
          duration: 300,
          easing: 'easeInExpo',
        });
      },
    });
  }, [revealed]);

  const progress = Math.min(100, Math.round((paintedCount / TOTAL_TILES) * 100));

  return (
    <div className="pixel-builder-root" style={{ position: 'relative' }}>
      <style>{`
        @keyframes termCursorBlink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes pixelProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}>
            Frontend Explorer
          </span>
          {/* Progress bar */}
          <div style={{ position: 'relative', width: 120, height: 2, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              background: '#D4A030',
              width: `${progress}%`,
              transition: 'width 0.1s linear',
            }} />
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, letterSpacing: 1,
            color: progress >= 60 ? '#D4A030' : 'rgba(255,255,255,0.2)',
            transition: 'color 0.3s',
          }}>
            {progress}%{progress >= 60 ? ' ✓' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, letterSpacing: 1,
            color: 'rgba(255,255,255,0.2)',
          }}>
            {revealed ? 'REVEALED' : `PAINT ${Math.round(PAINT_THRESHOLD * 100)}% TO UNLOCK`}
          </span>
          {/* Reset button */}
          <button
            onClick={handleReset}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8, letterSpacing: 2,
              textTransform: 'uppercase',
              padding: '4px 10px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4A030';
              (e.currentTarget as HTMLButtonElement).style.color = '#D4A030';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
            }}
            aria-label="Reset pixel art builder"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Grid canvas region ───────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        {/* Background gradients showing through tiles */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          {frontendProjects.map((p, i) => (
            <div key={i} style={{ background: p.gradient, opacity: 0.75 }} />
          ))}
        </div>

        {/* Tile grid */}
        <div
          ref={gridRef}
          onMouseMove={handleMouseMove}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            gap: 1,
            height: 280,
            background: 'rgba(0,0,0,0.3)',
            cursor: revealed ? 'default' : 'crosshair',
          }}
          aria-label="Pixel art grid — move your cursor to paint tiles and reveal frontend projects"
          role="region"
        >
          {tiles.map((tile, idx) => (
            <div
              key={idx}
              ref={el => { tileRefsMap.current[idx] = el; }}
              role="button"
              tabIndex={0}
              aria-label={`Tile ${tile.x},${tile.y} — ${tile.painted ? 'painted' : 'unpainted'}`}
              onKeyDown={e => handleTileKeyDown(e, idx)}
              style={{
                background: tile.painted ? 'transparent' : '#111',
                transition: tile.painted
                  ? 'background 0.15s ease'
                  : 'background 0.1s ease',
                outline: 'none',
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Hint text (fades when revealed) ──────────────────────────────── */}
      {!revealed && (
        <div style={{
          textAlign: 'center', marginTop: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: 2,
          color: 'rgba(255,255,255,0.18)',
          textTransform: 'uppercase',
          animation: 'pulse-subtle 2.5s ease-in-out infinite',
        }}>
          Move cursor over grid to paint · Paint 60% to reveal projects
        </div>
      )}

      {/* ── Project cards (slide in after reveal) ────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginTop: 24,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
        className="no-scrollbar"
      >
        {frontendProjects.map((proj, i) => (
          <TerminalCard key={i} project={proj} index={i} />
        ))}
      </div>
    </div>
  );
}
