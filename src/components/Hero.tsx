'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import Spline from '@splinetool/react-spline';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const splineContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Entrance animations with anime.js
  useEffect(() => {
    const timer = setTimeout(() => {
      // Text fade in + translateY
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll('.char');
        anime({
          targets: chars,
          translateY: [100, 0],
          opacity: [0, 1],
          easing: 'easeOutExpo',
          duration: 1200,
          delay: anime.stagger(35, { start: 150 }),
        });
      }

      // Tagline animation
      anime({
        targets: '.hero-tagline',
        translateY: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1000,
        delay: 600,
      });

      // Spline fades in slower
      anime({
        targets: '.hero-spline',
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 2000,
        delay: 400,
      });

      // Scroll indicator
      anime({
        targets: '.scroll-indicator',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutExpo',
        duration: 800,
        delay: 1600,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Scroll behavior with requestAnimationFrame
  useEffect(() => {
    const section = sectionRef.current;
    const splineContainer = splineContainerRef.current;
    const textContainer = textContainerRef.current;
    if (!section || !splineContainer || !textContainer) return;

    let ticking = false;

    const updateTransforms = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollThreshold = viewportHeight * 0.15; // First 15vh
      const progress = Math.min(scrollY / scrollThreshold, 1);

      // Text slides upward
      const textTranslateY = progress * -100;
      const textOpacity = 1 - progress * 0.5;
      textContainer.style.transform = `translateY(${textTranslateY}px)`;
      textContainer.style.opacity = String(textOpacity);

      // Spline scales down and moves toward top-right corner
      const splineScale = 1 - progress * 0.4;
      const splineTranslateX = progress * 100;
      const splineTranslateY = progress * -150;
      splineContainer.style.transform = `translate(${splineTranslateX}px, ${splineTranslateY}px) scale(${splineScale})`;

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(updateTransforms);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-black"
    >
      {/* Grid background lines */}
      <div className="absolute inset-0 grid-lines pointer-events-none">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Spline Scene - Right side, floating */}
      <div 
        ref={splineContainerRef}
        className="hero-spline absolute top-1/2 right-[-5%] -translate-y-1/2 w-[60vw] h-[60vw] max-w-200 max-h-200 opacity-0"
        style={{ willChange: 'transform' }}
      >
        <Spline
          scene="https://prod.spline.design/yGtY-du0EwyTr4sU/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Text Content - Left side, anchored bottom */}
      <div 
        ref={textContainerRef}
        className="absolute bottom-0 left-0 section-padding pb-24 z-10"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Tagline with mustard accent - only ONE highlighted word */}
        <p className="hero-tagline text-subtitle text-white/50 mb-6 max-w-xl opacity-0">
          Crafting <span className="text-mustard">extraordinary</span> digital experiences
        </p>

        {/* Main Title - Massive, clipped by viewport */}
        <h1 
          ref={titleRef}
          className="hero-title text-display font-medium text-white overflow-visible"
          style={{ 
            marginLeft: '-0.05em',
            lineHeight: 0.85,
          }}
        >
          <span className="block overflow-hidden">
            {'PARRV'.split('').map((char, i) => (
              <span 
                key={i} 
                className="char inline-block opacity-0"
                style={{ transformOrigin: 'bottom left' }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>

        {/* Meta info */}
        <div className="flex gap-16 mt-12 text-mono">
          <div className="hero-tagline opacity-0">
            <span className="block text-white text-sm mb-1">Location</span>
            <span className="text-white/50">New Delhi, India</span>
          </div>
          <div className="hero-tagline opacity-0">
            <span className="block text-white text-sm mb-1">Status</span>
            <span className="text-white/50">Available for projects</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0">
        <span className="text-caption text-white/30 tracking-widest">Scroll</span>
        <div className="w-px h-16 bg-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-mustard animate-pulse" />
        </div>
      </div>
    </section>
  );
}