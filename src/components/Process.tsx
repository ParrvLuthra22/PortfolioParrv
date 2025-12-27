'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Deep dive into your vision, goals, and constraints. We ask the hard questions to uncover what truly matters.',
  },
  {
    number: '02',
    title: 'Define',
    description: 'Transform insights into strategy. Clear objectives, user journeys, and success metrics before a single pixel is placed.',
  },
  {
    number: '03',
    title: 'Design',
    description: 'Craft the experience. Every interaction intentional, every detail considered. Design that serves both form and function.',
  },
  {
    number: '04',
    title: 'Deliver',
    description: 'Build with precision. Clean code, smooth animations, and performance that matches the vision.',
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.process-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });

            anime({
              targets: '.process-step',
              translateY: [60, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 800,
              delay: anime.stagger(150, { start: 400 }),
            });

            if (lineRef.current) {
              anime({
                targets: lineRef.current,
                strokeDashoffset: [1000, 0],
                easing: 'easeOutExpo',
                duration: 2000,
                delay: 600,
              });
            }

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

  return (
    <section 
      ref={sectionRef}
      className="section-padding bg-black relative"
    >
      <div className="container-wide">
        <div className="mb-24">
          <span className="text-caption text-white/50 block mb-4">How We Work</span>
          <h2 className="process-title text-headline overflow-hidden text-white">
            {titleText.split('').map((char, i) => (
              <span key={i} className="char inline-block opacity-0">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
        </div>

        <div className="relative">
          <svg 
            className="absolute top-0 left-8 md:left-12 h-full w-px hidden md:block"
            preserveAspectRatio="none"
          >
            <path
              ref={lineRef}
              d="M0.5 0 V 100%"
              stroke="#D4A030"
              strokeWidth="1"
              fill="none"
              strokeDasharray="1000"
              strokeDashoffset="1000"
            />
          </svg>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`process-step opacity-0 flex gap-8 md:gap-16 ${
                  index % 2 === 1 ? 'md:flex-row-reverse md:text-right' : ''
                }`}
              >
                <div className="flex-shrink-0 w-16 md:w-24">
                  <span className="text-display text-white/10">{step.number}</span>
                </div>

                <div className={`flex-1 max-w-lg ${index % 2 === 1 ? 'md:ml-auto' : ''}`}>
                  <h3 className="text-title text-white mb-4 group">
                    {step.title}
                    <span className="inline-block w-0 group-hover:w-8 h-px bg-mustard ml-2 transition-all duration-300" />
                  </h3>
                  <p className="text-body text-white/50">
                    {step.description}
                  </p>
                </div>

                <div className="hidden md:block flex-shrink-0">
                  <div className="w-12 h-12 border border-white/10 hover:border-mustard hover:rotate-45 transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}