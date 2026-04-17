'use client';

import {
  useEffect, useRef, useState, useCallback,
} from 'react';
import anime from 'animejs';
import dynamic from 'next/dynamic';
import { useCursor } from '@/context/CursorContext';
import type { NeuralNetworkCanvasHandle } from './NeuralNetworkCanvas';

// Lazy-load heavy components (no SSR)
const FlowSimulator       = dynamic(() => import('./FlowSimulator'),        { ssr: false });
const NeuralNetworkCanvas  = dynamic(() => import('./NeuralNetworkCanvas'),  { ssr: false });
const PixelArtBuilder     = dynamic(() => import('./PixelArtBuilder'),      { ssr: false });
const ChartMorphGallery   = dynamic(() => import('./ChartMorphGallery'),    { ssr: false });
const PhoneTiltExperience = dynamic(() => import('./PhoneTiltExperience'),  { ssr: false });

// ─── Data ──────────────────────────────────────────────────────────────────────

const allProjects = [
  {
    name: 'upSosh',
    date: 'December 2024',
    github: 'https://github.com/ParrvLuthra22/upSosh',
    demo: 'https://upsosh.app',
    description: 'Full-stack event booking platform enabling users to create, discover, and book events.',
    highlights: [
      'Complete authentication system and real-time event management dashboard',
      'DodoPayments gateway for secure transactions and revenue tracking',
      'RESTful API with PostgreSQL optimization for concurrent bookings',
    ],
    tech: ['Next.js', 'Express.js', 'PostgreSQL', 'DodoPayments', 'REST APIs'],
  },
  {
    name: 'FoodKhoj',
    date: 'April 2025',
    github: 'https://github.com/ParrvLuthra22/FoodKhoj',
    demo: 'https://food-khoj.vercel.app',
    description: 'Responsive frontend for food delivery and tracking with real-time visualization.',
    highlights: [
      'Live APIs for real-time order tracking and delivery visualization',
      'Interactive map-based UI using React and Leaflet',
    ],
    tech: ['React', 'Tailwind CSS', 'Leaflet', 'REST APIs'],
  },
  {
    name: 'TuneMate',
    date: 'Nov–Dec 2024',
    github: 'https://github.com/ParrvLuthra22/musicMatch',
    demo: 'https://music-match-bay.vercel.app',
    description: 'Music-based dating app that matches users via Spotify habits and suggests concert dates.',
    highlights: [
      'Spotify API for top artists/genres and Ticketmaster API for concerts',
      'Real-time chat with Socket.io and collaborative playlist creation',
      'Music compatibility algorithm with match highlights dashboard',
    ],
    tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Spotify API'],
  },
  {
    name: 'AayrishAI',
    date: 'May 2025',
    github: 'https://github.com/ParrvLuthra22/AayrishAI',
    demo: 'https://drive.google.com/file/d/1C74ye46t0seS3kq8oCgCTmahsE79RGgb/view?usp=sharing',
    description: 'Cross-platform AI assistant for automating system and web tasks.',
    highlights: [
      'Voice interface, PyQt6 GUI, and NLP models for conversational interactions',
      'Async programming and API integrations for real-time performance',
    ],
    tech: ['Python', 'PyQt6', 'NLP', 'AsyncIO', 'REST APIs'],
  },
];

// AI/ML projects mapped to neural network output nodes (3 output nodes)
const aiProjects = [
  {
    outputIdx: 0,
    name: 'AayrishAI',
    date: 'May 2025',
    github: 'https://github.com/ParrvLuthra22/AayrishAI',
    demo: 'https://drive.google.com/file/d/1C74ye46t0seS3kq8oCgCTmahsE79RGgb/view?usp=sharing',
    description: 'Cross-platform AI assistant for automating system and web tasks using NLP.',
    highlights: [
      'Voice interface and PyQt6 GUI with NLP-driven intent recognition',
      'Async task execution pipeline with real-time feedback',
      'Multi-modal input: voice, text, and scripted macros',
    ],
    tech: ['Python', 'PyQt6', 'NLP', 'AsyncIO', 'REST APIs'],
    nodeLabel: 'NLP Model',
    accentColor: '#D4A030',
  },
  {
    outputIdx: 1,
    name: 'TuneMate Recommender',
    date: 'Nov–Dec 2024',
    github: 'https://github.com/ParrvLuthra22/musicMatch',
    demo: 'https://music-match-bay.vercel.app',
    description: 'Music compatibility algorithm that scores users based on overlapping artist/genre graphs.',
    highlights: [
      'Graph-based music taste analysis with weighted edge scoring',
      'Spotify API data normalized into feature vectors',
      'Real-time match score updates via Socket.io',
    ],
    tech: ['Node.js', 'Spotify API', 'Socket.io', 'Graph Algorithms'],
    nodeLabel: 'Recommender',
    accentColor: '#88CCEE',
  },
  {
    outputIdx: 2,
    name: 'FoodKhoj Vision',
    date: 'April 2025',
    github: 'https://github.com/ParrvLuthra22/FoodKhoj',
    demo: 'https://food-khoj.vercel.app',
    description: 'Geospatial delivery optimization using live map data and route prediction heuristics.',
    highlights: [
      'Route optimization with real-time Leaflet + OpenStreetMap data',
      'Predictive ETA using delivery frequency heuristics',
      'Live cluster visualization of delivery hotspots',
    ],
    tech: ['React', 'Leaflet', 'REST APIs', 'Geospatial Algorithms'],
    nodeLabel: 'GeospatialAI',
    accentColor: '#77DD77',
  },
];

type Tab = 'grid' | 'simulator' | 'neural' | 'frontend' | 'dataviz' | 'mobile';

// ─── Component ────────────────────────────────────────────────────────────────

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [activeTab, setActiveTab] = useState<Tab>('grid');
  const tabLineRef = useRef<HTMLDivElement>(null);

  // Neural playground state
  const neuralCanvasRef = useRef<NeuralNetworkCanvasHandle>(null);
  const [hoveredAiIdx, setHoveredAiIdx] = useState<number | null>(null);
  const [selectedAiIdx, setSelectedAiIdx] = useState<number | null>(null);
  const underlineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const { setMode } = useCursor();

  // ── Section entrance animation ──────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            anime({
              targets: '.work-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });
            anime({
              targets: '.project-card',
              translateY: [60, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 800,
              delay: anime.stagger(150, { start: 400 }),
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Tab underline animation ──────────────────────────────────────────────
  useEffect(() => {
    if (!tabLineRef.current) return;
    const idMap: Record<Tab, string> = {
      grid:      'tab-grid',
      simulator: 'tab-simulator',
      neural:    'tab-neural',
      frontend:  'tab-frontend',
      dataviz:   'tab-dataviz',
      mobile:    'tab-mobile',
    };
    const target = document.getElementById(idMap[activeTab]);
    if (!target || !tabLineRef.current) return;
    const rect = target.getBoundingClientRect();
    const parentRect = target.parentElement!.getBoundingClientRect();
    anime({
      targets: tabLineRef.current,
      left: rect.left - parentRect.left,
      width: rect.width,
      duration: 400,
      easing: 'easeOutExpo',
    });
  }, [activeTab]);

  // ── Tab content entrance ─────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'grid') {
      anime({
        targets: '.project-card',
        translateY: [30, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(100),
      });
    } else if (activeTab === 'simulator') {
      anime({ targets: '.simulator-wrapper', opacity: [0, 1], translateY: [20, 0], easing: 'easeOutExpo', duration: 600 });
    } else if (activeTab === 'neural') {
      anime({ targets: '.neural-wrapper', opacity: [0, 1], translateY: [20, 0], easing: 'easeOutExpo', duration: 600 });
      anime({
        targets: '.ai-card',
        translateY: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(100, { start: 300 }),
      });
    } else if (activeTab === 'frontend') {
      anime({ targets: '.frontend-wrapper', opacity: [0, 1], translateY: [20, 0], easing: 'easeOutExpo', duration: 500 });
    } else if (activeTab === 'dataviz') {
      anime({ targets: '.dataviz-wrapper', opacity: [0, 1], translateY: [20, 0], easing: 'easeOutExpo', duration: 500 });
    } else if (activeTab === 'mobile') {
      anime({ targets: '.mobile-wrapper', opacity: [0, 1], translateY: [20, 0], easing: 'easeOutExpo', duration: 500 });
    }
  }, [activeTab]);

  // ── Cursor mode when neural tab active ──────────────────────────────────
  useEffect(() => {
    if (activeTab === 'neural') {
      setMode('neural');
    } else {
      setMode('default');
    }
    return () => setMode('default');
  }, [activeTab, setMode]);

  // ── AI card hover ──────────────────────────────────────────────────────
  const handleAiCardHover = useCallback((idx: number | null) => {
    setHoveredAiIdx(idx);
    if (selectedAiIdx !== null) return; // don't override selection
    neuralCanvasRef.current?.pauseAmbient(idx !== null);
    neuralCanvasRef.current?.highlightOutput(idx !== null ? aiProjects[idx].outputIdx : null);

    // Underline reveal
    underlineRefs.current.forEach((el, i) => {
      if (!el) return;
      anime({
        targets: el,
        clipPath: i === idx
          ? ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']
          : ['inset(0 0% 0 0)', 'inset(0 100% 0 0)'],
        duration: 380,
        easing: 'easeOutExpo',
      });
    });
  }, [selectedAiIdx]);

  // ── AI card click (select) ──────────────────────────────────────────────
  const handleAiCardClick = useCallback((idx: number) => {
    const isSame = selectedAiIdx === idx;
    const newSelected = isSame ? null : idx;
    setSelectedAiIdx(newSelected);

    // Neural network
    neuralCanvasRef.current?.selectOutput(
      newSelected !== null ? aiProjects[newSelected].outputIdx : null
    );
    neuralCanvasRef.current?.pauseAmbient(newSelected !== null);

    // Detail panel reveal/hide
    if (detailPanelRef.current) {
      if (newSelected !== null) {
        anime({
          targets: detailPanelRef.current,
          clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutExpo',
        });
      } else {
        anime({
          targets: detailPanelRef.current,
          clipPath: ['inset(0 0 0% 0)', 'inset(0 0 100% 0)'],
          opacity: [1, 0],
          duration: 350,
          easing: 'easeInExpo',
        });
      }
    }

    // Card selection ring flicker
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      anime({
        targets: el,
        borderColor: i === newSelected
          ? 'rgba(212,160,48,0.6)'
          : 'rgba(255,255,255,0.08)',
        duration: 400,
        easing: 'easeOutExpo',
      });
    });

    // Stagger edge animation via timeout relay (visual dramatic effect)
    if (newSelected !== null) {
      const proj = aiProjects[newSelected];
      // Brief flash on card
      anime({
        targets: cardRefs.current[idx],
        backgroundColor: [proj.accentColor + '18', 'transparent'],
        duration: 600,
        easing: 'easeOutExpo',
      });
    }
  }, [selectedAiIdx]);

  const selectedAiProject = selectedAiIdx !== null ? aiProjects[selectedAiIdx] : null;
  const titleText = 'WORK';

  return (
    <section
      ref={sectionRef}
      id="work"
      className="section-padding bg-black relative"
    >
      <style>{`
        @keyframes tooltipEnter {
          from { opacity: 0; transform: translateX(-50%) translateY(calc(-140% + 8px)) scale(0.88); }
          to   { opacity: 1; transform: translateX(-50%) translateY(-140%) scale(1); }
        }
        @keyframes neuralPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,160,48,0); }
          50% { box-shadow: 0 0 0 6px rgba(212,160,48,0.15); }
        }
        .ai-card-selected { animation: neuralPulse 2s ease-in-out infinite; }
        @keyframes termCursorBlink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="container-wide">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="text-caption text-white/30 block mb-4 tracking-widest">Projects</span>
            <h2 className="work-title text-headline overflow-hidden text-white">
              {titleText.split('').map((char, i) => (
                <span key={i} className="char inline-block opacity-0">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h2>
          </div>
          <p className="text-body text-white/50 mt-6 md:mt-0 md:max-w-md">
            Full-stack, AI, and interactive experiences — spanning every layer of the stack.
          </p>
        </div>

        {/* ── Tab bar ───────────────────────────────────────────────────── */}
        <div className="relative mb-10 border-b border-white/8 flex items-center gap-8 flex-wrap">
          {([
            { id: 'tab-grid',      label: 'All Projects', tab: 'grid'      as Tab, dot: undefined },
            { id: 'tab-simulator', label: 'Live Flow',    tab: 'simulator'  as Tab, dot: '#77DD77' },
            { id: 'tab-neural',    label: 'AI / ML',      tab: 'neural'     as Tab, dot: '#D4A030' },
            { id: 'tab-frontend',  label: 'Frontend',     tab: 'frontend'   as Tab, dot: '#A855F7' },
            { id: 'tab-dataviz',   label: 'Data Viz',     tab: 'dataviz'    as Tab, dot: '#88CCEE' },
            { id: 'tab-mobile',    label: 'Mobile',       tab: 'mobile'     as Tab, dot: '#FF8FA3' },
          ] as const).map(({ id, label, tab, dot }) => (
            <button
              key={tab}
              id={id}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                background: 'none', border: 'none', cursor: 'pointer',
                paddingBottom: 12,
                color: activeTab === tab ? '#D4A030' : 'rgba(255,255,255,0.3)',
                transition: 'color 0.3s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {label}
              {dot && (
                <span style={{
                  display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                  background: activeTab === tab ? dot : dot + '66',
                  boxShadow: activeTab === tab ? `0 0 6px ${dot}` : 'none',
                  animation: 'pulse-subtle 2s ease-in-out infinite',
                  verticalAlign: 'middle', marginTop: -1,
                }} />
              )}
            </button>
          ))}

          {/* Sliding underline */}
          <div
            ref={tabLineRef}
            style={{
              position: 'absolute', bottom: -1, height: 1,
              background: '#D4A030',
              left: 0, width: 80,
            }}
          />
        </div>

        {/* ── Tab: All Projects Grid ─────────────────────────────────────── */}
        {activeTab === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allProjects.map((project, index) => (
              <div
                key={index}
                className="project-card opacity-0 p-8 border border-white/10 hover:border-mustard/30 transition-colors duration-500 group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-title text-white group-hover:text-mustard transition-colors duration-300">
                      {project.name}
                    </h3>
                    <span className="text-mono text-white/30 text-xs">{project.date}</span>
                  </div>
                  <div className="flex gap-4">
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                      className="text-mono text-xs text-white/30 hover:text-mustard transition-colors duration-300"
                      data-cursor="link">GitHub</a>
                    <a href={project.demo} target="_blank" rel="noopener noreferrer"
                      className="text-mono text-xs text-white/30 hover:text-mustard transition-colors duration-300"
                      data-cursor="link">Demo</a>
                  </div>
                </div>
                <p className="text-body text-white/50 mb-6">{project.description}</p>
                <ul className="space-y-2 mb-6">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="text-body text-white/40 flex items-start gap-3 text-sm">
                      <span className="text-mustard mt-1">→</span>{h}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t, i) => (
                    <span key={i} className="text-mono text-xs px-3 py-1 border border-white/10 text-white/40">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Live Flow Simulator ───────────────────────────────────── */}
        {activeTab === 'simulator' && (
          <div className="simulator-wrapper opacity-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Interactive Architecture
                </span>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, maxWidth: 480, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Watch live data packets traverse the full stack. Click any node to explore the project behind that layer.
                </p>
              </div>
              <div style={{ padding: '10px 18px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>Stack</div>
                {['Next.js', 'Express.js', 'PostgreSQL / MongoDB', 'Socket.io'].map((t, i) => (
                  <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>{t}</div>
                ))}
              </div>
            </div>
            <FlowSimulator />
          </div>
        )}

        {/* ── Tab: AI/ML Neural Playground ──────────────────────────────── */}
        {activeTab === 'neural' && (
          <div
            className="neural-wrapper opacity-0"
            data-cursor="neural"
            onMouseEnter={() => setMode('neural')}
            onMouseLeave={() => setMode('default')}
          >
            {/* Header blurb */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
              <div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Neural Network Playground
                </span>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, maxWidth: 520, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Each output node represents an AI/ML project. Click a card below to illuminate the neural pathways feeding that model.
                </p>
              </div>
              {/* Layer legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Input', color: 'rgba(255,255,255,0.5)' },
                  { label: 'Hidden × 2', color: 'rgba(255,255,255,0.3)' },
                  { label: 'Output', color: '#D4A030' },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, boxShadow: `0 0 5px ${l.color}` }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Canvas ── */}
            <div
              style={{
                position: 'relative',
                height: 220,
                marginBottom: 0,
                border: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              <NeuralNetworkCanvas
                ref={neuralCanvasRef}
                className="absolute inset-0 w-full h-full"
              />
              {/* Output node labels overlay */}
              <div style={{
                position: 'absolute',
                right: '5%',
                top: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                pointerEvents: 'none',
              }}>
                {aiProjects.map((p, i) => (
                  <div key={i} style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 7, letterSpacing: 1,
                    color: selectedAiIdx === i || hoveredAiIdx === i ? p.accentColor : 'rgba(255,255,255,0.2)',
                    textTransform: 'uppercase',
                    transition: 'color 0.3s',
                    textAlign: 'right',
                  }}>
                    {p.nodeLabel}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Project cards row ────────────────────────────────────── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0,
              marginTop: 0,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {aiProjects.map((proj, i) => (
                <div
                  key={i}
                  ref={el => { cardRefs.current[i] = el; }}
                  className={`ai-card opacity-0 ${selectedAiIdx === i ? 'ai-card-selected' : ''}`}
                  onMouseEnter={() => handleAiCardHover(i)}
                  onMouseLeave={() => handleAiCardHover(null)}
                  onClick={() => handleAiCardClick(i)}
                  style={{
                    padding: '24px 20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderTop: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.3s',
                    background: selectedAiIdx === i
                      ? proj.accentColor + '0A'
                      : 'transparent',
                  }}
                >
                  {/* Output node connector line */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: '50%',
                    width: 1, height: 12,
                    background: selectedAiIdx === i || hoveredAiIdx === i ? proj.accentColor : 'rgba(255,255,255,0.1)',
                    transform: 'translateX(-50%) translateY(-100%)',
                    transition: 'background 0.3s',
                  }} />

                  {/* Animated underline */}
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 2, color: proj.accentColor, textTransform: 'uppercase', marginBottom: 6 }}>
                      Output {proj.outputIdx}
                    </div>
                    <h3 style={{
                      fontSize: 'clamp(1rem,1.5vw,1.4rem)',
                      fontWeight: 500, letterSpacing: '-0.01em',
                      color: '#fff', lineHeight: 1.1, marginBottom: 4,
                    }}>
                      {proj.name}
                    </h3>
                    {/* Underline that reveals on hover */}
                    <div
                      ref={el => { underlineRefs.current[i] = el; }}
                      style={{
                        height: 1,
                        background: proj.accentColor,
                        clipPath: 'inset(0 100% 0 0)',
                        marginBottom: 4,
                      }}
                    />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>
                      {proj.date}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 12 }}>
                    {proj.description}
                  </p>

                  {/* Mini tech tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {proj.tech.slice(0, 3).map((t, ti) => (
                      <span key={ti} style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 7, letterSpacing: 1,
                        padding: '2px 6px',
                        border: `1px solid ${proj.accentColor}33`,
                        color: proj.accentColor,
                        textTransform: 'uppercase',
                      }}>{t}</span>
                    ))}
                  </div>

                  {/* Click hint */}
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 7, letterSpacing: 1,
                    color: 'rgba(255,255,255,0.15)',
                    textTransform: 'uppercase',
                    marginTop: 12,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ color: proj.accentColor }}>■</span>
                    {selectedAiIdx === i ? 'click to collapse' : 'click to explore'}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Detail panel (expands on select) ─────────────────────── */}
            <div
              ref={detailPanelRef}
              style={{
                clipPath: 'inset(0 0 100% 0)',
                opacity: 0,
                overflow: 'hidden',
              }}
            >
              {selectedAiProject && (
                <div style={{
                  border: `1px solid ${selectedAiProject.accentColor}33`,
                  borderTop: 'none',
                  padding: '32px 28px',
                  background: `linear-gradient(135deg, ${selectedAiProject.accentColor}06 0%, transparent 60%)`,
                  position: 'relative',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 2, color: selectedAiProject.accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
                        {selectedAiProject.nodeLabel} — Full Details
                      </div>
                      <h3 style={{ fontSize: 'clamp(1.4rem,2vw,2rem)', fontWeight: 500, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>
                        {selectedAiProject.name}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <a href={selectedAiProject.github} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, color: selectedAiProject.accentColor, textDecoration: 'none', textTransform: 'uppercase' }}>
                        GitHub ↗
                      </a>
                      <a href={selectedAiProject.demo} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase' }}>
                        Demo ↗
                      </a>
                    </div>
                  </div>

                  {/* Description + highlights split */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.65, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 16, maxWidth: 440 }}>
                        {selectedAiProject.description}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {selectedAiProject.tech.map((t, i) => (
                          <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1, padding: '3px 8px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedAiProject.highlights.map((h, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 8 }}>
                          <span style={{ color: selectedAiProject.accentColor, marginTop: 3, flexShrink: 0 }}>→</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ── Tab: Frontend Pixel Builder ───────────────────────────────── */}
        {activeTab === 'frontend' && (
          <div className="frontend-wrapper opacity-0">
            {/* Section intro */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
              <div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase', display: 'block', marginBottom: 6,
                }}>
                  Interactive Reveal
                </span>
                <p style={{
                  color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6,
                  maxWidth: 480, fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  Move your cursor over the grid to paint tiles and reveal the projects hidden beneath.
                  Reach{' '}
                  <span style={{ color: '#D4A030', fontFamily: "'JetBrains Mono', monospace" }}>60%</span>
                  {' '}coverage to unlock the full showcase.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'React / Next.js', color: '#61DAFB' },
                  { label: 'Tailwind CSS', color: '#38BDF8' },
                  { label: 'Anime.js', color: '#A855F7' },
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: 1,
                      background: t.color,
                    }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8, letterSpacing: 1,
                      color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                    }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <PixelArtBuilder />
          </div>
        )}
        {/* ── Tab: Data Viz Chart Gallery ───────────────────────────────── */}
        {activeTab === 'dataviz' && (
          <div className="dataviz-wrapper opacity-0">
            {/* Section intro */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
              <div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase', display: 'block', marginBottom: 6,
                }}>
                  Live Chart Morphing
                </span>
                <p style={{
                  color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6,
                  maxWidth: 500, fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  Click a chart type to morph between visualizations. Each chart reveals a different project&apos;s data story. Auto-cycles every 4 seconds.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                {([
                  { label: 'Bar · Performance', color: '#D4A030' },
                  { label: 'Line · Growth',     color: '#88CCEE' },
                  { label: 'Scatter · Skills',  color: '#77DD77' },
                  { label: 'Radial · Breakdown',color: '#FF8FA3' },
                ] as const).map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: 1, background: t.color }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8, letterSpacing: 1,
                      color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                    }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ChartMorphGallery />
          </div>
        )}
        {/* ── Tab: Mobile Phone Tilt ──────────────────────────────────── */}
        {activeTab === 'mobile' && (
          <div className="mobile-wrapper opacity-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
              <div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase', display: 'block', marginBottom: 6,
                }}>
                  3D Phone Showcase
                </span>
                <p style={{
                  color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6,
                  maxWidth: 480, fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  Move your cursor over the stage to tilt the phone. Click a project pill to swipe between apps.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                {([
                  { label: 'TuneMate · iOS + Android',  color: '#A855F7' },
                  { label: 'FoodKhoj · Android',        color: '#4ADE80' },
                  { label: 'AayrishAI · iOS + Android', color: '#D4A030' },
                ] as const).map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, boxShadow: `0 0 5px ${t.color}` }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8, letterSpacing: 1,
                      color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                    }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <PhoneTiltExperience />
          </div>
        )}
      </div>
    </section>
  );
}