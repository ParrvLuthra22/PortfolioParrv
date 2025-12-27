'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import Link from 'next/link';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      anime({
        targets: menuRef.current,
        clipPath: ['circle(0% at 100% 0%)', 'circle(150% at 100% 0%)'],
        easing: 'easeOutExpo',
        duration: 800,
      });

      anime({
        targets: '.menu-item',
        translateY: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(80, { start: 200 }),
      });
    } else {
      anime({
        targets: menuRef.current,
        clipPath: ['circle(150% at 100% 0%)', 'circle(0% at 100% 0%)'],
        easing: 'easeInExpo',
        duration: 500,
      });
    }
  }, [isOpen]);

  const menuItems = [
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className="section-padding py-0">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-body font-medium tracking-tight relative group text-white"
              data-cursor="link"
            >
              <span className="relative z-10">PARRV</span>
              <span className="absolute bottom-0 left-0 w-full h-px bg-mustard scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="link-underline text-body text-white/50 hover:text-white transition-colors duration-300"
                  data-cursor="link"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5"
              aria-label="Toggle menu"
            >
              <span 
                className={`w-6 h-px bg-white transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-1' : ''
                }`} 
              />
              <span 
                className={`w-6 h-px bg-white transition-all duration-300 ${
                  isOpen ? '-rotate-45 -translate-y-1' : ''
                }`} 
              />
            </button>
          </div>
        </div>

        <div 
          className={`absolute inset-0 -z-10 transition-opacity duration-500 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)',
          }}
        />
      </nav>

      <div
        ref={menuRef}
        className="fixed inset-0 z-40 bg-black md:hidden"
        style={{ clipPath: 'circle(0% at 100% 0%)' }}
      >
        <div className="h-full flex flex-col justify-center section-padding">
          <div className="space-y-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="menu-item block text-headline text-white opacity-0 hover:text-mustard transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-mono text-mustard mr-4">0{index + 1}</span>
                {item.label}
              </a>
            ))}
          </div>

          <div className="absolute bottom-8 left-0 right-0 section-padding">
            <div className="flex justify-between items-end">
              <div className="text-mono text-white/50">
                <span className="block">hello@parrv.dev</span>
                <span>San Francisco, CA</span>
              </div>
              <div className="flex gap-4 text-mono text-white/50">
                <a href="#" className="hover:text-mustard transition-colors">TW</a>
                <a href="#" className="hover:text-mustard transition-colors">GH</a>
                <a href="#" className="hover:text-mustard transition-colors">LI</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-progress">
        <div className="scroll-progress-bar" />
      </div>
    </>
  );
}