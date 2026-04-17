'use client';

import {
  useEffect, useRef, useState, useCallback, useMemo,
} from 'react';
import anime from 'animejs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhoneState {
  rotateX: number;
  rotateY: number;
  reflectX: number;
  reflectY: number;
}

interface AppProject {
  id: string;
  name: string;
  tagline: string;
  platform: 'ios' | 'android' | 'both';
  gradient: [string, string, string];
  accentColor: string;
  uiElements: string[];   // descriptive labels of UI el mocked in the screen
  github: string;
  demo: string;
  tech: string[];
  highlights: string[];
  screenGradient: string; // CSS gradient for the screen placeholder
}

interface ParallaxLayer {
  id: number;
  factor: number;
  size: number;
  x: string;
  y: string;
  color: string;
  borderRadius: string;
  opacity: number;
}

// ─── Project Data ─────────────────────────────────────────────────────────────

const APP_PROJECTS: AppProject[] = [
  {
    id: 'tunemate',
    name: 'TuneMate',
    tagline: 'Match through music',
    platform: 'both',
    gradient: ['#1a0a2e', '#2d1060', '#4a0080'],
    accentColor: '#A855F7',
    uiElements: ['Match Card', 'Music Player', 'Chat', 'Discovery'],
    github: 'https://github.com/ParrvLuthra22/musicMatch',
    demo: 'https://music-match-bay.vercel.app',
    tech: ['React Native', 'Socket.io', 'Spotify API', 'MongoDB'],
    highlights: [
      'Swipe-based matching with song preview on card hover',
      'Real-time chat with typing indicators and audio messages',
      'Daily curated playlist suggestions based on match affinity',
    ],
    screenGradient: 'linear-gradient(160deg, #1a0a2e 0%, #3d1680 50%, #1DB954 100%)',
  },
  {
    id: 'foodkhoj',
    name: 'FoodKhoj',
    tagline: 'Food. Found. Fast.',
    platform: 'android',
    gradient: ['#0a1a0a', '#0d2b0d', '#1a4a1a'],
    accentColor: '#4ADE80',
    uiElements: ['Map View', 'Order Track', 'Menu', 'Cart'],
    github: 'https://github.com/ParrvLuthra22/FoodKhoj',
    demo: 'https://foodkhoj.vercel.app',
    tech: ['React', 'Leaflet', 'Node.js', 'REST APIs'],
    highlights: [
      'Live map tracking with animated delivery markers',
      'Predictive ETA based on traffic and distance data',
      'One-tap reorder with smart cart memory',
    ],
    screenGradient: 'linear-gradient(160deg, #0a1500 0%, #0d3318 50%, #4ADE80 100%)',
  },
  {
    id: 'aayrishai',
    name: 'AayrishAI',
    tagline: 'Your AI companion',
    platform: 'both',
    gradient: ['#0a0a1a', '#1a1a40', '#2a2060'],
    accentColor: '#D4A030',
    uiElements: ['Voice UI', 'Task Runner', 'Settings', 'History'],
    github: 'https://github.com/ParrvLuthra22/AayrishAI',
    demo: 'https://drive.google.com/file/d/1C74ye46t0seS3kq8oCgCTmahsE79RGgb/view',
    tech: ['Python', 'PyQt6', 'NLP', 'AsyncIO'],
    highlights: [
      'Voice-first UI with waveform visualizer and live transcription',
      'Task execution pipeline with parallel async job queue',
      'Context-aware follow-up queries with session memory',
    ],
    screenGradient: 'linear-gradient(160deg, #0a0a1a 0%, #2a1a60 50%, #D4A030 100%)',
  },
];

const PARALLAX_LAYERS: ParallaxLayer[] = [
  { id: 0, factor: 0.02, size: 180, x: '10%',  y: '20%', color: '#D4A030', borderRadius: '40% 60% 55% 45%', opacity: 0.08 },
  { id: 1, factor: 0.05, size: 120, x: '78%',  y: '15%', color: '#ffffff', borderRadius: '60% 40% 30% 70%', opacity: 0.05 },
  { id: 2, factor: 0.08, size: 90,  x: '15%',  y: '65%', color: '#A855F7', borderRadius: '50% 50% 65% 35%', opacity: 0.07 },
  { id: 3, factor: 0.03, size: 150, x: '72%',  y: '60%', color: '#D4A030', borderRadius: '35% 65% 45% 55%', opacity: 0.06 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── CSS Phone Screen UI mock ─────────────────────────────────────────────────

function PhoneScreen({ project }: { project: AppProject }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: project.screenGradient,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 2,
    }}>
      {/* CRT scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 6px)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Status bar mock */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 22, padding: '4px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.3)', zIndex: 3,
      }}>
        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>9:41</span>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {[3, 5, 7].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
          ))}
          <div style={{ width: 12, height: 6, border: '1px solid rgba(255,255,255,0.5)', borderRadius: 2, marginLeft: 3, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: '70%', background: project.accentColor, borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* App header */}
      <div style={{
        position: 'absolute', top: 22, left: 0, right: 0,
        padding: '10px 14px 8px',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: `1px solid ${project.accentColor}33`,
        zIndex: 3,
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif', letterSpacing: 0.3, marginBottom: 2 }}>
          {project.name}
        </div>
        <div style={{ fontSize: 7, color: project.accentColor, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase' }}>
          {project.tagline}
        </div>
      </div>

      {/* Mock UI cards */}
      <div style={{
        position: 'absolute', top: 78, left: 8, right: 8,
        display: 'flex', flexDirection: 'column', gap: 6,
        zIndex: 3,
      }}>
        {project.uiElements.map((label, i) => (
          <div key={i} style={{
            height: 28 + (i === 0 ? 14 : 0),
            background: i === 0
              ? `linear-gradient(90deg, ${project.accentColor}33, rgba(255,255,255,0.05))`
              : 'rgba(255,255,255,0.05)',
            borderRadius: 6,
            border: `1px solid ${i === 0 ? project.accentColor + '55' : 'rgba(255,255,255,0.08)'}`,
            padding: '4px 8px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {/* Icon dot */}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.accentColor, opacity: i === 0 ? 1 : 0.4, flexShrink: 0 }} />
            {/* Label */}
            <div style={{ fontSize: 7, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
              {label}
            </div>
            {/* Fake content bar */}
            {i !== 0 && (
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${60 + i * 10}%`, background: project.accentColor + '66', borderRadius: 2 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom nav strip */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 32,
        background: 'rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 3,
      }}>
        {['⬤', '◆', '▲', '●'].map((icon, i) => (
          <div key={i} style={{ fontSize: i === 0 ? 8 : 6, color: i === 0 ? project.accentColor : 'rgba(255,255,255,0.25)' }}>
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Project detail card ──────────────────────────────────────────────────────

function AppStoreButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const handleEnter = () => {
    if (!btnRef.current) return;
    anime({ targets: btnRef.current, scale: [1, 1.08, 1], duration: 500, easing: 'easeOutElastic(1, .5)' });
  };
  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 8, letterSpacing: 1,
        padding: '6px 14px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.05)',
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        textTransform: 'uppercase',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onFocus={handleEnter}
    >
      {label}
    </button>
  );
}

function ProjectDetailCard({ project }: { project: AppProject }) {
  return (
    <div style={{
      border: `1px solid ${project.accentColor}33`,
      background: `linear-gradient(135deg, ${project.gradient[0]} 0%, ${project.gradient[1]} 100%)`,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${project.accentColor}, ${project.accentColor}44)` }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 2, color: project.accentColor, textTransform: 'uppercase', marginBottom: 4 }}>
            Mobile · {project.platform === 'both' ? 'iOS + Android' : project.platform === 'ios' ? 'iOS' : 'Android'}
          </div>
          <h3 style={{ fontSize: 'clamp(1rem,1.5vw,1.4rem)', fontWeight: 500, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 2 }}>
            {project.name}
          </h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
            {project.tagline}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <AppStoreButton label="GitHub ↗" onClick={() => window.open(project.github, '_blank')} />
          <AppStoreButton label="Demo ↗" onClick={() => window.open(project.demo, '_blank')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 14 }}>
        {/* Highlights */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {project.highlights.map((h, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', lineHeight: 1.65, marginBottom: 4 }}>
              <span style={{ color: project.accentColor, flexShrink: 0, marginTop: 2 }}>→</span>{h}
            </li>
          ))}
        </ul>
        {/* Tech stack */}
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, letterSpacing: 2, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>Stack</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {project.tech.map((t, i) => (
              <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, letterSpacing: 1, padding: '2px 7px', border: `1px solid ${project.accentColor}44`, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PhoneTiltExperience() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [gyroPermission, setGyroPermission] = useState<'idle' | 'granted' | 'denied'>('idle');

  const sectionRef     = useRef<HTMLDivElement>(null);
  const phoneWrapRef   = useRef<HTMLDivElement>(null);
  const screenARef     = useRef<HTMLDivElement>(null);  // outgoing screen
  const screenBRef     = useRef<HTMLDivElement>(null);  // incoming screen
  const reflectRef     = useRef<HTMLDivElement>(null);
  const pillLineRef    = useRef<HTMLDivElement>(null);
  const pillRefs       = useRef<(HTMLButtonElement | null)[]>([]);
  const blobRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const phoneState     = useRef<PhoneState>({ rotateX: 0, rotateY: 0, reflectX: 50, reflectY: 30 });
  const gyroEMA        = useRef({ x: 0, y: 0 });
  const activeAnims    = useRef<ReturnType<typeof anime>[]>([]);
  const screenA        = useRef(0);  // index shown in screenA
  const usingA         = useRef(true); // which div is currently "front"

  // ── Detect coarse pointer (mobile) ─────────────────────────────────────
  useEffect(() => {
    setIsMobileDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // ── Move pill underline ─────────────────────────────────────────────────
  const movePillLine = useCallback((idx: number) => {
    const btn = pillRefs.current[idx];
    const line = pillLineRef.current;
    if (!btn || !line) return;
    const btnRect  = btn.getBoundingClientRect();
    const parentRect = btn.parentElement!.getBoundingClientRect();
    anime({
      targets: line,
      left: btnRect.left - parentRect.left,
      width: btnRect.width,
      duration: 380,
      easing: 'easeOutExpo',
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => movePillLine(0), 100);
    return () => clearTimeout(t);
  }, [movePillLine]);

  // ── Tilt phone on mouse move ────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMobileDevice) return;
    const section = sectionRef.current;
    const phoneWrap = phoneWrapRef.current;
    if (!section || !phoneWrap) return;

    const rect = section.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width  / 2);   // -1..1
    const ny = (e.clientY - cy) / (rect.height / 2);   // -1..1

    const targetRX = clamp(ny * -14, -15, 15);
    const targetRY = clamp(nx * 18,  -20, 20);

    // Smooth phone tilt
    const anim = anime({
      targets: phoneWrap,
      rotateX: targetRX,
      rotateY: targetRY,
      duration: 400,
      easing: 'easeOutQuart',
    });
    activeAnims.current.push(anim);

    // Reflection shift opposite to tilt
    const rX = 50 - nx * 18;
    const rY = 30 - ny * 12;
    if (reflectRef.current) {
      reflectRef.current.style.background = `linear-gradient(${rX}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 70%)`;
    }

    // Parallax blobs
    PARALLAX_LAYERS.forEach((layer, i) => {
      const el = blobRefs.current[i];
      if (!el) return;
      const tx = nx * layer.factor * rect.width  * 0.5;
      const ty = ny * layer.factor * rect.height * 0.5;
      const anim2 = anime({ targets: el, translateX: tx, translateY: ty, duration: 700, easing: 'easeOutQuart' });
      activeAnims.current.push(anim2);
    });
  }, [isMobileDevice]);

  // ── Phone "tap" bounce animation ────────────────────────────────────────
  const doTapBounce = useCallback(() => {
    const phoneWrap = phoneWrapRef.current;
    if (!phoneWrap) return;
    const anim = anime.timeline({
      targets: phoneWrap,
      easing: 'easeInOutCubic',
    })
      .add({ rotateX: 15,    duration: 160 })
      .add({ rotateX: phoneState.current.rotateX, duration: 380, easing: 'easeOutQuart' });
    activeAnims.current.push(anim as unknown as ReturnType<typeof anime>);
  }, []);

  // ── Screen swipe transition ─────────────────────────────────────────────
  const switchProject = useCallback((newIdx: number) => {
    if (newIdx === activeIdx || isSwapping) return;
    setIsSwapping(true);
    setPendingIdx(newIdx);
    movePillLine(newIdx);
    doTapBounce();

    const outEl = usingA.current ? screenARef.current : screenBRef.current;
    const inEl  = usingA.current ? screenBRef.current : screenARef.current;
    if (!outEl || !inEl) return;

    // Position incoming slide off-screen right
    anime.set(inEl, { translateX: '100%', opacity: 1, display: 'block' });

    // Animate out
    const animOut = anime({
      targets: outEl,
      translateX: [0, '-105%'],
      duration: 350,
      easing: 'easeInOutCubic',
    });
    // Animate in
    const animIn = anime({
      targets: inEl,
      translateX: ['105%', 0],
      duration: 350,
      easing: 'easeInOutCubic',
      complete: () => {
        // Hide the outgoing screen
        anime.set(outEl, { translateX: 0, opacity: 0 });
        usingA.current = !usingA.current;
        setActiveIdx(newIdx);
        setIsSwapping(false);
      },
    });
    activeAnims.current.push(animOut, animIn);
  }, [activeIdx, doTapBounce, isSwapping, movePillLine]);

  // ── Gyroscope (mobile) ──────────────────────────────────────────────────
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const alpha = 0.1;  // EMA coefficient
    const rawX = clamp(e.beta  ?? 0, -20, 20);
    const rawY = clamp(e.gamma ?? 0, -20, 20);
    gyroEMA.current.x = lerp(gyroEMA.current.x, rawX, alpha);
    gyroEMA.current.y = lerp(gyroEMA.current.y, rawY, alpha);

    const phoneWrap = phoneWrapRef.current;
    if (!phoneWrap) return;
    anime({
      targets: phoneWrap,
      rotateX: gyroEMA.current.x * -0.8,
      rotateY: gyroEMA.current.y * 0.8,
      duration: 200,
      easing: 'easeOutQuart',
    });
  }, []);

  // ── Request gyro permission on first tap (iOS 13+) ──────────────────────
  const requestGyro = useCallback(async () => {
    if (gyroPermission !== 'idle') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DevOri = (DeviceOrientationEvent as unknown as any);
    if (typeof DevOri.requestPermission === 'function') {
      try {
        const result = await DevOri.requestPermission() as string;
        if (result === 'granted') {
          setGyroPermission('granted');
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setGyroPermission('denied');
        }
      } catch {
        setGyroPermission('denied');
      }
    } else {
      // Non-iOS — permission not needed
      setGyroPermission('granted');
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }, [gyroPermission, handleOrientation]);

  // ── Event bindings ──────────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!isMobileDevice) {
      section.addEventListener('mousemove', handleMouseMove);
    } else {
      section.addEventListener('click', requestGyro, { once: true });
    }

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('click', requestGyro);
      window.removeEventListener('deviceorientation', handleOrientation);
      // Cancel all active anime.js instances
      activeAnims.current.forEach(a => {
        try { a.pause(); } catch { /* noop */ }
      });
      activeAnims.current = [];
    };
  }, [handleMouseMove, handleOrientation, isMobileDevice, requestGyro]);

  // ── Initial screen setup ────────────────────────────────────────────────
  useEffect(() => {
    if (screenBRef.current) {
      anime.set(screenBRef.current, { opacity: 0, translateX: 0 });
    }
  }, []);

  const [pendingIdx, setPendingIdx] = useState<number | null>(null);

  const activeProject = APP_PROJECTS[activeIdx];
  // During a swap, Screen B shows the incoming (pending) project
  const pendingProject = pendingIdx !== null ? APP_PROJECTS[pendingIdx] : APP_PROJECTS[(activeIdx + 1) % APP_PROJECTS.length];

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        perspective: 1200,
        perspectiveOrigin: 'center center',
        overflow: 'hidden',
        minHeight: 520,
        userSelect: 'none',
      }}
    >
      {/* ── Parallax blobs ─────────────────────────────────────────────── */}
      {PARALLAX_LAYERS.map((layer, i) => (
        <div
          key={layer.id}
          ref={el => { blobRefs.current[i] = el; }}
          style={{
            position: 'absolute',
            left: layer.x,
            top: layer.y,
            width: layer.size,
            height: layer.size,
            background: layer.color,
            borderRadius: layer.borderRadius,
            opacity: layer.opacity,
            filter: 'blur(30px)',
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        />
      ))}

      {/* ── Stage layout: phone left, info right ───────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        alignItems: 'start',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* ── Left: Phone 3D mockup ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Phone wrapper — receives tilt transforms */}
          <div
            ref={phoneWrapRef}
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              display: 'inline-block',
              cursor: isMobileDevice ? 'default' : 'none',
            }}
          >
            {/* Phone body */}
            <div style={{
              width: 200,
              height: 400,
              borderRadius: 36,
              background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #0d0d0d 100%)',
              boxShadow: isMobileDevice
                ? '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)'
                : '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1), 8px 8px 24px rgba(0,0,0,0.5), -2px -2px 12px rgba(255,255,255,0.04)',
              padding: 6,
              position: 'relative',
              transformStyle: 'preserve-3d',
            }}>

              {/* Side buttons (right) */}
              {[80, 120, 200].map((top, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  right: -4, top,
                  width: 4, height: i === 0 ? 28 : 46,
                  background: 'linear-gradient(to right, #111, #2a2a2a)',
                  borderRadius: '0 3px 3px 0',
                }} />
              ))}
              {/* Volume buttons (left) */}
              {[100, 150].map((top, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: -4, top,
                  width: 4, height: 36,
                  background: 'linear-gradient(to left, #111, #2a2a2a)',
                  borderRadius: '3px 0 0 3px',
                }} />
              ))}

              {/* Screen bezel */}
              <div style={{
                borderRadius: 30,
                overflow: 'hidden',
                height: '100%',
                background: '#000',
                position: 'relative',
              }}>
                {/* Notch */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80, height: 22,
                  background: '#0d0d0d',
                  borderRadius: '0 0 16px 16px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}>
                  {/* Front camera dot */}
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                  {/* Speaker grille */}
                  <div style={{ width: 28, height: 3, background: '#1a1a1a', borderRadius: 2 }} />
                </div>

                {/* ── Screen slides (A + B for swipe) ── */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  {/* Screen A */}
                  <div ref={screenARef} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
                    <PhoneScreen project={activeProject} />
                  </div>
                  {/* Screen B (incoming project for swipe) */}
                  <div ref={screenBRef} style={{ position: 'absolute', inset: 0, willChange: 'transform', opacity: 0 }}>
                    <PhoneScreen project={pendingProject} />
                  </div>

                  {/* Reflection overlay */}
                  <div
                    ref={reflectRef}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.14) 45%, rgba(255,255,255,0) 70%)',
                      pointerEvents: 'none',
                      zIndex: 5,
                      borderRadius: 'inherit',
                    }}
                  />
                </div>
              </div>

              {/* Home indicator */}
              <div style={{
                position: 'absolute',
                bottom: 12, left: '50%',
                transform: 'translateX(-50%)',
                width: 60, height: 3,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
              }} />
            </div>
          </div>

          {/* ── Project pills ── */}
          <div style={{ marginTop: 28, position: 'relative' }}>
            <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
              {APP_PROJECTS.map((proj, i) => (
                <button
                  key={proj.id}
                  ref={el => { pillRefs.current[i] = el; }}
                  onClick={() => switchProject(i)}
                  aria-pressed={activeIdx === i}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9, letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    padding: '8px 16px',
                    paddingBottom: 12,
                    border: 'none', background: 'none',
                    cursor: 'pointer',
                    color: activeIdx === i ? activeProject.accentColor : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.3s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {proj.name}
                </button>
              ))}
              {/* Sliding underline */}
              <div
                ref={pillLineRef}
                style={{
                  position: 'absolute', bottom: 0,
                  height: 1.5,
                  background: activeProject.accentColor,
                  left: 0, width: 80,
                  transition: 'background 0.4s',
                }}
              />
            </div>
          </div>

          {/* Mobile gyro hint */}
          {isMobileDevice && gyroPermission === 'idle' && (
            <div style={{
              marginTop: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8, letterSpacing: 1,
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              Tap to enable tilt
            </div>
          )}
        </div>

        {/* ── Right: Project info panel ── */}
        <div style={{ paddingTop: 8 }}>
          {/* App label header */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8, letterSpacing: 2,
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              Mobile App · {activeProject.platform === 'both' ? 'iOS + Android' : activeProject.platform}
            </div>
            <h3 style={{
              fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
              fontWeight: 500, letterSpacing: '-0.03em',
              color: '#fff', lineHeight: 1, marginBottom: 6,
            }}>
              {activeProject.name}
            </h3>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: 1,
              color: activeProject.accentColor,
              textTransform: 'uppercase',
            }}>
              {activeProject.tagline}
            </p>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${activeProject.accentColor}44, transparent)`, marginBottom: 16 }} />

          {/* Detail card */}
          <ProjectDetailCard project={activeProject} />
        </div>
      </div>
    </div>
  );
}
