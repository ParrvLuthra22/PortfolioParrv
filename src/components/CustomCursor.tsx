'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    // Smooth cursor follow with tighter lerp for responsiveness
    const animateCursor = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.2;
      pos.current.y += (target.current.y - pos.current.y) * 0.2;
      
      cursor.style.transform = `translate(${pos.current.x - cursor.offsetWidth / 2}px, ${pos.current.y - cursor.offsetHeight / 2}px)`;
      
      requestAnimationFrame(animateCursor);
    };

    // Handle hover states
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      
      if (target.matches('a, button, [data-cursor="link"]')) {
        cursor.classList.add('hovering-link');
        if (cursorTextRef.current) {
          cursorTextRef.current.textContent = 'View';
          cursorTextRef.current.style.opacity = '1';
        }
      } else if (target.matches('[data-cursor="hover"]')) {
        cursor.classList.add('hovering');
      }
    };

    const handleMouseLeave = () => {
      cursor.classList.remove('hovering', 'hovering-link');
      if (cursorTextRef.current) {
        cursorTextRef.current.style.opacity = '0';
      }
    };

    // Magnetic effect for buttons
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach((el) => {
      const element = el as HTMLElement;
      
      element.addEventListener('mousemove', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = element.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left - rect.width / 2;
        const y = mouseEvent.clientY - rect.top - rect.height / 2;
        
        anime({
          targets: element,
          translateX: x * 0.3,
          translateY: y * 0.3,
          duration: 300,
          easing: 'easeOutQuad',
        });
      });

      element.addEventListener('mouseleave', () => {
        anime({
          targets: element,
          translateX: 0,
          translateY: 0,
          duration: 500,
          easing: 'easeOutElastic(1, 0.5)',
        });
      });
    });

    window.addEventListener('mousemove', handleMouseMove);
    document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    animateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor-dot hidden md:flex items-center justify-center">
      <span 
        ref={cursorTextRef} 
        className="text-[10px] uppercase tracking-widest text-black opacity-0 transition-opacity duration-300"
      >
        View
      </span>
    </div>
  );
}
