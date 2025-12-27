'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Deep dive into your vision, goals, and constraints. We ask the hard questions to uncover what truly matters.',
    offset: 0, // Left aligned
  },
  {
    number: '02',
    title: 'Define',
    description: 'Transform insights into strategy. Clear objectives, user journeys, and success metrics before a single pixel is placed.',
    offset: 1, // Right aligned
  },
  {
    number: '03',
    title: 'Design',
    description: 'Craft the experience. Every interaction intentional, every detail considered. Design that serves both form and function.',
    offset: 0, // Left aligned
  },
  {
    number: '04',
    title: 'Deliver',
    description: 'Build with precision. Clean code, smooth animations, and performance that matches the vision.',
    offset: 1, // Right aligned
  },
];

// Abstract 3D-style icons for each step
const icons = [
  // Discover - Magnifying glass / eye abstract
  <svg key="discover" viewBox="0 0 60 60" className="w-full h-full">
    <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20" />
    <circle cx="30" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30" />
    <circle cx="30" cy="30" r="4" fill="currentColor" className="text-mustard" />
    <line x1="44" y1="44" x2="55" y2="55" stroke="currentColor" strokeWidth="1" className="text-white/20" />
  </svg>,
  // Define - Grid / framework abstract
  <svg key="define" viewBox="0 0 60 60" className="w-full h-full">
    <rect x="10" y="10" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20" />
    <rect x="34" y="10" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30" />
    <rect x="10" y="34" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30" />
    <rect x="34" y="34" width="16" height="16" fill="currentColor" className="text-mustard/30" stroke="currentColor" strokeWidth="1" />
  </svg>,
  // Design - Pen / creation abstract
  <svg key="design" viewBox="0 0 60 60" className="w-full h-full">
    <polygon points="30,5 55,50 5,50" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20" />
    <polygon points="30,18 45,45 15,45" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30" />
    <circle cx="30" cy="38" r="5" fill="currentColor" className="text-mustard" />
  </svg>,
  // Deliver - Rocket / launch abstract
  <svg key="deliver" viewBox="0 0 60 60" className="w-full h-full">
    <path d="M30 5 L45 30 L37 30 L37 55 L23 55 L23 30 L15 30 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20" />
    <circle cx="30" cy="22" r="5" fill="currentColor" className="text-mustard" />
    <line x1="10" y1="50" x2="20" y2="40" stroke="currentColor" strokeWidth="1" className="text-white/30" />
    <line x1="50" y1="50" x2="40" y2="40" stroke="currentColor" strokeWidth="1" className="text-white/30" />
  </svg>,
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const iconsRef = useRef<(HTMLDivElement | null)[]>([]);
  const hasAnimated = useRef(false);

  // Continuous icon rotation
  useEffect(() => {
    iconsRef.current.forEach((icon, index) => {
      if (icon) {
        anime({
          targets: icon,
          rotateY: [0, 360],
          easing: 'linear',
          duration: 8000 + index * 1000, // Slightly different speeds
          loop: true,
        });
      }
    });
  }, []);

  // Sequential reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Title animation
            anime({
              targets: '.process-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });

            // SVG path draw animation
            if (pathRef.current) {
              const pathLength = pathRef.current.getTotalLength();
              pathRef.current.style.strokeDasharray = `${pathLength}`;
              pathRef.current.style.strokeDashoffset = `${pathLength}`;

              anime({
                targets: pathRef.current,
                strokeDashoffset: [pathLength, 0],
                easing: 'easeInOutQuad',
                duration: 2500,
                delay: 500,
              });
            }

            // Steps reveal sequentially
            stepsRef.current.forEach((step, index) => {
              if (step) {
                anime({
                  targets: step,
                  translateY: [80, 0],
                  translateX: [index % 2 === 0 ? -40 : 40, 0],
                  opacity: [0, 1],
                  easing: 'easeOutExpo',
                  duration: 1000,
                  delay: 600 + index * 300,
                });
              }
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const titleText = "PROCESS";

  // Calculate zigzag SVG path connecting all steps
  const generateZigzagPath = () => {
    // Points roughly matching step positions
    // Left side starts around x=15%, right side around x=85%
    const points = [
      { x: 15, y: 12 },  // Step 1 - left
      { x: 85, y: 37 },  // Step 2 - right
      { x: 15, y: 62 },  // Step 3 - left
      { x: 85, y: 87 },  // Step 4 - right
    ];

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Create smooth curves between points
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      path += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  return (
    <section 
      ref={sectionRef}
      className="section-padding bg-black relative overflow-hidden"
    >
      <div className="container-wide">
        {/* Header */}
        <div className="mb-24 md:mb-32">
          <span className="text-caption text-white/30 block mb-4 tracking-widest">How We Work</span>
          <h2 className="process-title text-headline overflow-hidden text-white">
            {titleText.split('').map((char, i) => (
              <span key={i} className="char inline-block opacity-0">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
        </div>

        {/* Timeline container */}
        <div className="relative min-h-[800px] md:min-h-[1000px]">
          {/* SVG connecting line */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              d={generateZigzagPath()}
              fill="none"
              stroke="#D4A030"
              strokeWidth="0.15"
              strokeLinecap="round"
              style={{ 
                vectorEffect: 'non-scaling-stroke',
                strokeWidth: '1px',
              }}
            />
          </svg>

          {/* Steps */}
          <div className="relative space-y-24 md:space-y-32">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={el => { stepsRef.current[index] = el; }}
                className={`opacity-0 flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                  step.offset === 1 
                    ? 'md:ml-auto md:mr-0 md:flex-row-reverse md:text-right' 
                    : 'md:mr-auto md:ml-0'
                }`}
                style={{ 
                  maxWidth: '600px',
                  willChange: 'transform, opacity',
                }}
              >
                {/* Abstract 3D Icon */}
                <div 
                  ref={el => { iconsRef.current[index] = el; }}
                  className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20"
                  style={{ 
                    perspective: '200px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {icons[index]}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Number + Title row */}
                  <div className={`flex items-center gap-4 mb-4 ${step.offset === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <span className="text-mono text-mustard text-sm">{step.number}</span>
                    <div className={`h-px bg-white/10 flex-1 max-w-16 ${step.offset === 1 ? 'md:ml-0' : ''}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-title text-white mb-4 group inline-block">
                    {step.title}
                    <span 
                      className={`block h-px bg-mustard mt-2 transition-all duration-500 w-0 group-hover:w-full ${
                        step.offset === 1 ? 'md:ml-auto' : ''
                      }`} 
                    />
                  </h3>

                  {/* Description */}
                  <p className="text-body text-white/50" style={{ maxWidth: '45ch' }}>
                    {step.description}
                  </p>
                </div>

                {/* Decorative dot marker */}
                <div 
                  className={`hidden md:block absolute w-3 h-3 rounded-full bg-mustard ${
                    step.offset === 1 ? 'right-0 md:right-auto md:left-[85%]' : 'left-0 md:left-[15%]'
                  }`}
                  style={{
                    top: `${12 + index * 25}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-24 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-white/10" />
          <span className="text-mono text-white/30 text-xs tracking-widest">REPEAT</span>
          <div className="h-px w-16 bg-white/10" />
        </div>
      </div>
    </section>
  );
}