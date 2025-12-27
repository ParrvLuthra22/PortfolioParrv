'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import anime from 'animejs';

const projects = [
  {
    id: 1,
    title: 'Nebula',
    category: 'Brand Identity',
    year: '2024',
    image: '/projects/nebula.jpg',
    gridArea: '1 / 1 / 3 / 3', // Primary large tile - spans 2 cols, 2 rows
  },
  {
    id: 2,
    title: 'Cipher',
    category: 'Web Application',
    year: '2024',
    image: '/projects/cipher.jpg',
    gridArea: '1 / 3 / 2 / 4', // Top right
  },
  {
    id: 3,
    title: 'Flux',
    category: 'Interactive Experience',
    year: '2023',
    image: '/projects/flux.jpg',
    gridArea: '1 / 4 / 3 / 5', // Right tall
  },
  {
    id: 4,
    title: 'Aether',
    category: 'E-Commerce',
    year: '2023',
    image: '/projects/aether.jpg',
    gridArea: '2 / 3 / 3 / 4', // Middle small
  },
  {
    id: 5,
    title: 'Prism',
    category: 'Mobile App',
    year: '2023',
    image: '/projects/prism.jpg',
    gridArea: '3 / 1 / 4 / 2', // Bottom left
  },
  {
    id: 6,
    title: 'Vertex',
    category: 'Dashboard',
    year: '2023',
    image: '/projects/vertex.jpg',
    gridArea: '3 / 2 / 4 / 5', // Bottom wide
  },
];

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const animatedTiles = useRef<Set<number>>(new Set());

  // Custom cursor position tracking
  const updateCursor = useCallback((e: MouseEvent) => {
    if (cursorRef.current) {
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', updateCursor);
    return () => window.removeEventListener('mousemove', updateCursor);
  }, [updateCursor]);

  // Title animation on section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.work-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Individual tile clip-path reveal when entering viewport center
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    tilesRef.current.forEach((tile, index) => {
      if (!tile) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !animatedTiles.current.has(index)) {
              animatedTiles.current.add(index);
              
              anime({
                targets: tile,
                clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
                easing: 'easeOutExpo',
                duration: 1200,
                delay: 100,
              });

              observer.disconnect();
            }
          });
        },
        { 
          threshold: 0.5, // Trigger when tile is at viewport center
          rootMargin: '-20% 0px -20% 0px' // Narrow the trigger zone
        }
      );

      observer.observe(tile);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  // Hover effect: scale hovered tile, compress neighbors
  const handleMouseEnter = (id: number, index: number) => {
    setHoveredId(id);
    setCursorVisible(true);

    // Scale up hovered tile
    anime({
      targets: tilesRef.current[index],
      scale: 1.03,
      easing: 'easeOutExpo',
      duration: 400,
    });

    // Compress neighboring tiles
    tilesRef.current.forEach((tile, i) => {
      if (i !== index && tile) {
        anime({
          targets: tile,
          scale: 0.97,
          easing: 'easeOutExpo',
          duration: 400,
        });
      }
    });
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setCursorVisible(false);

    // Reset all tiles
    tilesRef.current.forEach((tile) => {
      if (tile) {
        anime({
          targets: tile,
          scale: 1,
          easing: 'easeOutExpo',
          duration: 400,
        });
      }
    });
  };

  const titleText = "SELECTED WORK";

  return (
    <section 
      ref={sectionRef}
      className="section-padding bg-black relative"
    >
      {/* Custom 'View' cursor */}
      <div
        ref={cursorRef}
        className={`fixed pointer-events-none z-50 flex items-center justify-center transition-all duration-300 ${
          cursorVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
        style={{
          width: '80px',
          height: '80px',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      >
        <div className="w-full h-full rounded-full bg-mustard flex items-center justify-center">
          <span className="text-black text-xs font-medium tracking-wider uppercase">View</span>
        </div>
      </div>

      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <span className="text-caption text-white/30 block mb-4 tracking-widest">Portfolio</span>
            <h2 className="work-title text-headline overflow-hidden text-white">
              {titleText.split('').map((char, i) => (
                <span key={i} className="char inline-block opacity-0">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h2>
          </div>
          
          <p className="text-body text-white/50 mt-6 md:mt-0 md:max-w-md">
            A curated selection of projects spanning brand identity, web development, and interactive experiences.
          </p>
        </div>

        {/* Bento Grid */}
        <div 
          ref={gridRef}
          className="grid gap-3 md:gap-4"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(3, minmax(200px, 280px))',
          }}
        >
          {projects.map((project, index) => (
            <a 
              key={project.id}
              ref={el => { tilesRef.current[index] = el; }}
              href={`/work/${project.id}`}
              className="work-tile block relative overflow-hidden group"
              style={{ 
                gridArea: project.gridArea,
                clipPath: 'inset(100% 0 0 0)',
                willChange: 'transform, clip-path',
              }}
              onMouseEnter={() => handleMouseEnter(project.id, index)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Full-bleed image placeholder */}
              <div 
                className="absolute inset-0 bg-white/5 transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-500" />

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                {/* Mustard accent line - animates in on hover */}
                <div 
                  className={`h-px bg-mustard mb-4 transition-all duration-500 ease-out ${
                    hoveredId === project.id ? 'w-16 opacity-100' : 'w-0 opacity-0'
                  }`}
                />

                {/* Category + Year */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-mono text-xs text-mustard tracking-wider">{project.category}</span>
                  <span className="text-mono text-xs text-white/40">{project.year}</span>
                </div>

                {/* Title - slides upward on hover */}
                <h3 
                  className={`text-title text-white transition-transform duration-500 ease-out ${
                    hoveredId === project.id ? '-translate-y-2' : 'translate-y-0'
                  }`}
                >
                  {project.title}
                </h3>

                {/* Arrow indicator */}
                <div 
                  className={`absolute top-6 right-6 transition-all duration-500 ${
                    hoveredId === project.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1" className="text-mustard" />
                  </svg>
                </div>
              </div>

              {/* Border */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none" />
            </a>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-16">
          <button 
            className="magnetic-btn group relative overflow-hidden border border-white/20 px-8 py-4 text-white transition-colors duration-300 hover:border-mustard"
            data-magnetic
          >
            <span className="relative z-10 text-mono tracking-wider group-hover:text-mustard transition-colors duration-300">
              View All Projects
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}