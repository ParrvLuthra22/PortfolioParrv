'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { useCursor } from '@/context/CursorContext';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLSpanElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const { mode } = useCursor();

  // Morph cursor shape based on mode
  useEffect(() => {
    const cursor = cursorRef.current;
    const crosshair = crosshairRef.current;
    if (!cursor || !crosshair) return;

    if (mode === 'neural') {
      // Crosshair mode
      anime({
        targets: cursor,
        width: 32,
        height: 32,
        borderRadius: '0%',
        borderWidth: 1,
        opacity: 0.6,
        duration: 300,
        easing: 'easeOutExpo',
      });
      anime({
        targets: crosshair,
        opacity: 1,
        scale: 1,
        duration: 300,
        easing: 'easeOutExpo',
      });
    } else {
      // Reset to dot
      anime({
        targets: cursor,
        width: 12,
        height: 12,
        borderRadius: '50%',
        opacity: 1,
        duration: 300,
        easing: 'easeOutExpo',
      });
      anime({
        targets: crosshair,
        opacity: 0,
        scale: 0.5,
        duration: 200,
        easing: 'easeInExpo',
      });
    }
  }, [mode]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    // Smooth cursor follow with tighter lerp for responsiveness
    let rafId: number;
    const animateCursor = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.2;
      pos.current.y += (target.current.y - pos.current.y) * 0.2;

      cursor.style.transform = `translate(${pos.current.x - cursor.offsetWidth / 2}px, ${pos.current.y - cursor.offsetHeight / 2}px)`;

      rafId = requestAnimationFrame(animateCursor);
    };

    // Handle hover states
    const handleMouseEnter = (e: Event) => {
      const el = e.target as HTMLElement;

      if (el.matches('a, button, [data-cursor="link"]')) {
        cursor.classList.add('hovering-link');
        cursor.classList.remove('hovering');
        if (cursorTextRef.current) {
          cursorTextRef.current.textContent = 'View';
          cursorTextRef.current.style.opacity = '1';
        }
      } else if (el.matches('[data-cursor="hover"]')) {
        cursor.classList.add('hovering');
        cursor.classList.remove('hovering-link');
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
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor-dot hidden md:flex items-center justify-center">
      {/* crosshair lines — visible in neural mode */}
      <div
        ref={crosshairRef}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          transform: 'scale(0.5)',
          pointerEvents: 'none',
        }}
      >
        {/* Horizontal bar */}
        <div style={{
          position: 'absolute',
          top: '50%', left: 0, right: 0,
          height: 1,
          background: '#D4A030',
          transform: 'translateY(-50%)',
        }} />
        {/* Vertical bar */}
        <div style={{
          position: 'absolute',
          left: '50%', top: 0, bottom: 0,
          width: 1,
          background: '#D4A030',
          transform: 'translateX(-50%)',
        }} />
        {/* Center dot */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 3, height: 3,
          borderRadius: '50%',
          background: '#D4A030',
          transform: 'translate(-50%, -50%)',
        }} />
      </div>
      <span
        ref={cursorTextRef}
        className="text-[10px] uppercase tracking-widest text-black opacity-0 transition-opacity duration-300"
      >
        View
      </span>
    </div>
  );
}
