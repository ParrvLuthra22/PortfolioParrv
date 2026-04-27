'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';
import { PROJECTS, CATEGORIES, EMPTY_CATEGORIES, categorizeTech } from '@/data/projects';
import type { Category, Project, TechFamily } from '@/data/projects';

// ─── Tech tag colours ─────────────────────────────────────────────────────────
const TECH_COLORS: Record<TechFamily, string> = {
  ai:       'rgba(167,139,250,0.15)',
  frontend: 'rgba(52,211,153,0.15)',
  backend:  'rgba(96,165,250,0.15)',
  database: 'rgba(245,158,11,0.15)',
  default:  'rgba(255,255,255,0.08)',
};
const TECH_TEXT: Record<TechFamily, string> = {
  ai:       '#A78BFA',
  frontend: '#34D399',
  backend:  '#60A5FA',
  database: '#F59E0B',
  default:  'rgba(255,255,255,0.45)',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const GithubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// ─── Dot animation for Coming Soon ───────────────────────────────────────────
function ComingSoon() {
  const dot1 = useRef<HTMLSpanElement>(null);
  const dot2 = useRef<HTMLSpanElement>(null);
  const dot3 = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const anim = anime({
      targets: [dot1.current, dot2.current, dot3.current],
      opacity: [0.1, 1],
      duration: 600,
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(300),
      easing: 'easeInOutSine',
    });
    return () => anim.pause();
  }, []);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 40px',
      border: '1px dashed rgba(255,255,255,0.1)',
      gridColumn: '1 / -1',
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, letterSpacing: 3,
        color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        Projects incoming
        <span ref={dot1} style={{ opacity: 0.1 }}>.</span>
        <span ref={dot2} style={{ opacity: 0.1 }}>.</span>
        <span ref={dot3} style={{ opacity: 0.1 }}>.</span>
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9, letterSpacing: 2,
        color: '#FFB800', textTransform: 'uppercase', opacity: 0.7,
        padding: '3px 10px', border: '1px solid rgba(255,184,0,0.3)',
      }}>Soon</span>
    </div>
  );
}

// ─── Single project card ──────────────────────────────────────────────────────
function ProjectCard({ project, isExpanded, onToggle }: {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLUListElement>(null);
  const githubUnderRef = useRef<HTMLDivElement>(null);
  const demoUnderRef = useRef<HTMLDivElement>(null);

  // Card hover lift + border
  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;
    anime({ targets: cardRef.current, translateY: -4, duration: 250, easing: 'easeOutQuart' });
    anime({ targets: borderRef.current, opacity: [0, 1], duration: 250, easing: 'easeOutQuart' });
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    anime({ targets: cardRef.current, translateY: 0, duration: 250, easing: 'easeOutQuart' });
    anime({ targets: borderRef.current, opacity: [1, 0], duration: 250, easing: 'easeOutQuart' });
  }, []);

  // Highlights max-height expand/collapse via CSS transition (anime.js controls the trigger)
  const highlightsStyle: React.CSSProperties = {
    maxHeight: isExpanded ? 400 : 0,
    overflow: 'hidden',
    transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
    listStyle: 'none', padding: 0, margin: 0,
  };

  return (
    <div
      ref={cardRef}
      onClick={onToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="link"
      aria-label={`${project.title} — click to ${isExpanded ? 'collapse' : 'expand'} details`}
      style={{
        position: 'relative',
        background: project.gradient,
        padding: '28px 24px 22px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Mustard border overlay (animates on hover) */}
      <div ref={borderRef} style={{
        position: 'absolute', inset: 0,
        border: `1px solid rgba(255,184,0,0.3)`,
        pointerEvents: 'none', opacity: 0,
      }} />

      {/* Top row: title + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <h3 style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 18, fontWeight: 600, color: '#fff',
          letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0,
        }}>{project.title}</h3>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: project.accentColor,
          letterSpacing: 1, flexShrink: 0, marginLeft: 12, marginTop: 2,
        }}>{project.date}</span>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.6, marginBottom: 14, fontFamily: 'Inter, system-ui, sans-serif',
      }}>{project.description}</p>

      {/* Tech tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
        {project.tech.map((t) => {
          const fam = categorizeTech(t);
          return (
            <span key={t} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: 0.5,
              padding: '2px 8px',
              background: TECH_COLORS[fam],
              color: TECH_TEXT[fam],
              border: `1px solid ${TECH_TEXT[fam]}33`,
            }}>{t}</span>
          );
        })}
      </div>

      {/* Highlights (collapsible) */}
      <ul ref={highlightsRef} style={highlightsStyle}>
        <div style={{ height: 4 }} />
        {project.highlights.map((h, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            color: 'rgba(255,255,255,0.5)', fontSize: 12,
            lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 7,
          }}>
            <span style={{ color: project.accentColor, flexShrink: 0, marginTop: 3 }}>→</span>
            {h}
          </li>
        ))}
        <div style={{ height: 12 }} />
      </ul>

      {/* Links */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }} onClick={e => e.stopPropagation()}>
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            aria-label={`${project.title} GitHub repository`}
            onMouseEnter={() => anime({ targets: githubUnderRef.current, clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], duration: 300, easing: 'easeOutExpo' })}
            onMouseLeave={() => anime({ targets: githubUnderRef.current, clipPath: ['inset(0 0% 0 0)', 'inset(0 100% 0 0)'], duration: 200, easing: 'easeInExpo' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1,
              color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase',
            }}
          >
            <GithubIcon /> Code
            <div ref={githubUnderRef} style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.5)', clipPath: 'inset(0 100% 0 0)' }} />
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            aria-label={`${project.title} live demo`}
            onMouseEnter={() => anime({ targets: demoUnderRef.current, clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], duration: 300, easing: 'easeOutExpo' })}
            onMouseLeave={() => anime({ targets: demoUnderRef.current, clipPath: ['inset(0 0% 0 0)', 'inset(0 100% 0 0)'], duration: 200, easing: 'easeInExpo' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1,
              color: '#FFB800', textDecoration: 'none', textTransform: 'uppercase',
            }}
          >
            <ExternalIcon /> Live Demo
            <div ref={demoUnderRef} style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 1, background: '#FFB800', clipPath: 'inset(0 100% 0 0)' }} />
          </a>
        )}
        {/* Click hint */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1,
          color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
          marginLeft: 'auto', alignSelf: 'center',
        }}>
          {isExpanded ? '↑ collapse' : '↓ expand'}
        </span>
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function ProjectGrid() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tabIndicatorRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<anime.AnimeInstance | null>(null);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return PROJECTS;
    return PROJECTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const isEmpty = filteredProjects.length === 0;

  // Tab indicator slide
  const handleTabClick = useCallback((key: Category | 'all') => {
    const tabEl = document.getElementById(`proj-tab-${key}`);
    const barEl = document.getElementById('proj-tab-bar');
    if (tabEl && barEl && tabIndicatorRef.current) {
      const rect = tabEl.getBoundingClientRect();
      const barRect = barEl.getBoundingClientRect();
      anime({
        targets: tabIndicatorRef.current,
        left: rect.left - barRect.left,
        width: rect.width,
        duration: 350,
        easing: 'easeOutExpo',
      });
    }

    // Exit animation
    if (gridRef.current) {
      animRef.current?.pause();
      animRef.current = anime({
        targets: gridRef.current.querySelectorAll('.proj-card'),
        translateY: [0, -20],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
          setActiveCategory(key);
          setSelectedId(null);
        },
      });
    } else {
      setActiveCategory(key);
      setSelectedId(null);
    }
  }, []);

  // Enter animation when category changes
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.proj-card');
    animRef.current?.pause();
    animRef.current = anime({
      targets: cards,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutExpo',
      delay: anime.stagger(60),
    });
    return () => animRef.current?.pause();
  }, [activeCategory]);

  // Initial indicator position
  useEffect(() => {
    const tabEl = document.getElementById('proj-tab-all');
    const barEl = document.getElementById('proj-tab-bar');
    if (tabEl && barEl && tabIndicatorRef.current) {
      const rect = tabEl.getBoundingClientRect();
      const barRect = barEl.getBoundingClientRect();
      tabIndicatorRef.current.style.left = `${rect.left - barRect.left}px`;
      tabIndicatorRef.current.style.width = `${rect.width}px`;
    }
  }, []);

  const toggleCard = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div>
      {/* Category tab bar */}
      <div
        id="proj-tab-bar"
        style={{
          position: 'relative',
          display: 'flex', flexWrap: 'wrap', gap: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 28,
        }}
      >
        {CATEGORIES.map(({ key, label }) => {
          const empty = key !== 'all' && EMPTY_CATEGORIES.includes(key as Category);
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              id={`proj-tab-${key}`}
              onClick={() => handleTabClick(key)}
              aria-label={`Filter by ${label}`}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                textTransform: 'uppercase',
                background: 'none', border: 'none', cursor: 'pointer',
                paddingBottom: 12, paddingRight: 24, paddingLeft: 0,
                color: isActive ? '#FFB800' : 'rgba(255,255,255,0.3)',
                opacity: empty ? 0.45 : 1,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'color 0.25s',
              }}
            >
              {label}
              {empty && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 7, letterSpacing: 1,
                  color: '#FFB800', textTransform: 'uppercase',
                  padding: '1px 5px',
                  border: '1px solid rgba(255,184,0,0.4)',
                }}>Soon</span>
              )}
            </button>
          );
        })}
        {/* Sliding indicator */}
        <div
          ref={tabIndicatorRef}
          style={{
            position: 'absolute', bottom: -1, height: 2,
            background: '#FFB800',
            left: 0, width: 60,
            transition: 'none',
          }}
        />
      </div>

      {/* Cards grid */}
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: 16,
        }}
      >
        {isEmpty ? (
          <ComingSoon />
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="proj-card" style={{ opacity: 0 }}>
              <ProjectCard
                project={project}
                isExpanded={selectedId === project.id}
                onToggle={() => toggleCard(project.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
