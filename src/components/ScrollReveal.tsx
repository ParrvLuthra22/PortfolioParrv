'use client';

import { useEffect, useRef, ReactNode } from 'react';
import anime from 'animejs';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'clip-up' | 'stagger';
  delay?: number;
  threshold?: number;
  className?: string;
}

export default function ScrollReveal({ 
  children, 
  animation = 'fade-up',
  delay = 0,
  threshold = 0.2,
  className = ''
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let animationConfig: anime.AnimeParams = {};

            switch (animation) {
              case 'fade-up':
                animationConfig = {
                  targets: element,
                  translateY: [40, 0],
                  opacity: [0, 1],
                  easing: 'easeOutExpo',
                  duration: 800,
                  delay,
                };
                break;
              case 'fade-in':
                animationConfig = {
                  targets: element,
                  opacity: [0, 1],
                  easing: 'easeOutExpo',
                  duration: 600,
                  delay,
                };
                break;
              case 'clip-up':
                animationConfig = {
                  targets: element,
                  clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
                  easing: 'easeOutExpo',
                  duration: 1000,
                  delay,
                };
                break;
              case 'stagger':
                animationConfig = {
                  targets: element.children,
                  translateY: [30, 0],
                  opacity: [0, 1],
                  easing: 'easeOutExpo',
                  duration: 600,
                  delay: anime.stagger(100, { start: delay }),
                };
                break;
            }

            anime(animationConfig);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animation, delay, threshold]);

  const initialStyles: React.CSSProperties = {
    opacity: animation !== 'clip-up' ? 0 : 1,
    transform: animation === 'fade-up' ? 'translateY(40px)' : 'none',
    clipPath: animation === 'clip-up' ? 'inset(100% 0 0 0)' : 'none',
  };

  return (
    <div ref={ref} style={initialStyles} className={className}>
      {children}
    </div>
  );
}
