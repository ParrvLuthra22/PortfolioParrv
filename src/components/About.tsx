'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

const manifesto = [
  {
    number: '01',
    title: 'Design with Intent',
    description: 'Every pixel serves a purpose. We craft experiences that communicate clearly and connect emotionally, stripping away the unnecessary to reveal what matters.',
  },
  {
    number: '02', 
    title: 'Build for Tomorrow',
    description: 'Technology evolves rapidly. We create scalable, future-proof solutions using modern architectures that adapt and grow with your needs.',
  },
  {
    number: '03',
    title: 'Obsess Over Details',
    description: 'Excellence lives in the margins. From micro-interactions to typography choices, we refine until perfection becomes invisible.',
  },
];

// Abstract SVG line decorations for each card
const svgDecorations = [
  // Diagonal ascending line
  <svg key="0" viewBox="0 0 120 120" className="w-24 h-24" fill="none">
    <path d="M10 110 L60 60 L110 10" stroke="currentColor" strokeWidth="1" className="text-white/10 group-hover:text-mustard transition-colors duration-500" />
    <circle cx="60" cy="60" r="3" className="fill-white/10 group-hover:fill-mustard transition-colors duration-500" />
  </svg>,
  // Curved wave
  <svg key="1" viewBox="0 0 120 120" className="w-24 h-24" fill="none">
    <path d="M10 60 Q35 20 60 60 T110 60" stroke="currentColor" strokeWidth="1" className="text-white/10 group-hover:text-mustard transition-colors duration-500" />
    <line x1="60" y1="40" x2="60" y2="80" stroke="currentColor" strokeWidth="1" className="text-white/10 group-hover:text-mustard transition-colors duration-500" />
  </svg>,
  // Concentric corners
  <svg key="2" viewBox="0 0 120 120" className="w-24 h-24" fill="none">
    <path d="M10 10 L10 50 L50 50" stroke="currentColor" strokeWidth="1" className="text-white/10 group-hover:text-mustard transition-colors duration-500" />
    <path d="M30 30 L30 70 L70 70" stroke="currentColor" strokeWidth="1" className="text-white/10 group-hover:text-mustard transition-colors duration-500" />
    <path d="M50 50 L50 90 L90 90" stroke="currentColor" strokeWidth="1" className="text-white/10 group-hover:text-mustard transition-colors duration-500" />
  </svg>,
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Card reveal animations with spring-like easing and alternating directions
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Title character animation
            anime({
              targets: '.about-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });

            // Cards with alternating entry directions and spring easing
            const cards = document.querySelectorAll('.manifesto-card');
            cards.forEach((card, index) => {
              // Alternate: even cards from left, odd cards from right
              const fromX = index % 2 === 0 ? -60 : 60;

              anime({
                targets: card,
                translateX: [fromX, 0],
                opacity: [0, 1],
                easing: 'spring(1, 80, 10, 0)', // spring-like easing
                duration: 1000,
                delay: 300 + index * 150,
              });
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Horizontal scroll tied to vertical scroll + background color transition
  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;
    const bg = bgRef.current;
    if (!section || !cards || !bg) return;

    let rafId: number;
    let ticking = false;

    const updateScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress within this section
      const scrollProgress = Math.max(0, Math.min(1, 
        (windowHeight - sectionTop) / (sectionHeight + windowHeight)
      ));

      // Horizontal scroll
      const maxScroll = cards.scrollWidth - cards.clientWidth;
      cards.scrollLeft = scrollProgress * maxScroll;

      // Background transition: black (#000) to dark charcoal (#111)
      // Interpolate RGB values
      const r = Math.round(0 + scrollProgress * 17);
      const g = Math.round(0 + scrollProgress * 17);
      const b = Math.round(0 + scrollProgress * 17);
      bg.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const titleText = "PHILOSOPHY";

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[200vh]"
    >
      {/* Background with color transition */}
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-black"
        style={{ willChange: 'background-color' }}
      />

      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden section-padding relative z-10">
        {/* Section header */}
        <div className="mb-16">
          <span className="text-caption text-white/30 block mb-4 tracking-widest">About</span>
          <h2 className="about-title text-headline overflow-hidden text-white">
            {titleText.split('').map((char, i) => (
              <span key={i} className="char inline-block opacity-0">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
        </div>

        {/* Horizontal scroll container */}
        <div 
          ref={cardsRef}
          className="flex gap-8 overflow-x-auto no-scrollbar pb-4"
          style={{ scrollBehavior: 'auto' }}
        >
          {manifesto.map((item, index) => (
            <div 
              key={index}
              className="manifesto-card flex-shrink-0 w-[400px] md:w-[500px] p-8 md:p-10 bg-black border border-white/10 opacity-0 group"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Card number + line */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-mono text-mustard">{item.number}</span>
                <div className="h-px flex-1 bg-white/10 group-hover:bg-mustard transition-colors duration-500" />
              </div>
              
              {/* Bold headline */}
              <h3 className="text-title font-medium mb-6 text-white group-hover:text-mustard transition-colors duration-300">
                {item.title}
              </h3>
              
              {/* Body text with max-width */}
              <p className="text-body text-white/50" style={{ maxWidth: '45ch' }}>
                {item.description}
              </p>

              {/* Abstract SVG line decoration */}
              <div className="mt-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                {svgDecorations[index]}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3 text-mono text-white/30">
          <span className="tracking-wider">Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </section>
  );
}