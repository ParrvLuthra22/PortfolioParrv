'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import anime from 'animejs';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const emailContainerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const hasAnimated = useRef(false);
  const lastSoundTime = useRef(0);

  // Sound effect for interactions with debounce
  const playHoverSound = useCallback(() => {
    if (!soundEnabled) return;
    
    // 200ms debounce to prevent rapid-fire sounds
    const now = Date.now();
    if (now - lastSoundTime.current < 200) return;
    lastSoundTime.current = now;
    
    try {
      const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Letter animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Email letters animate with rotation - 0.05s stagger
            anime({
              targets: '.email-char',
              translateY: [120, 0],
              rotateZ: [20, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1200,
              delay: anime.stagger(50), // 0.05s = 50ms stagger
            });

            // Supporting text
            anime({
              targets: '.contact-text',
              translateY: [40, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 800,
              delay: anime.stagger(100, { start: 1000 }),
            });

            // Social links cluster
            anime({
              targets: '.social-link',
              translateY: [20, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 600,
              delay: anime.stagger(60, { start: 1400 }),
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

  // Magnetic pull effect for email
  useEffect(() => {
    const emailContainer = emailContainerRef.current;
    const email = emailRef.current;
    if (!emailContainer || !email) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = emailContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Distance from cursor to center
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      // Magnetic pull radius - refined to be less aggressive
      const magnetRadius = 150;
      
      if (distance < magnetRadius) {
        // Calculate pull strength (stronger when closer)
        const pull = 1 - (distance / magnetRadius);
        const moveX = distX * pull * 0.08;
        const moveY = distY * pull * 0.08;

        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          anime({
            targets: email,
            translateX: moveX,
            translateY: moveY,
            duration: 400,
            easing: 'easeOutQuad',
          });
        });
      }
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafId);
      anime({
        targets: email,
        translateX: 0,
        translateY: 0,
        duration: 800,
        easing: 'easeOutElastic(1, 0.4)',
      });
    };

    // Listen on document for wider magnetic range
    document.addEventListener('mousemove', handleMouseMove);
    emailContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      emailContainer.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const email = "hello@parrv.dev";
  const socials = [
    { name: 'X', url: 'https://twitter.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
    { name: 'Read.cv', url: 'https://read.cv' },
  ];

  return (
    <>
      <section 
        ref={sectionRef}
        className="min-h-screen flex flex-col justify-center section-padding bg-black relative overflow-hidden"
      >
        <div className="container-wide">
          {/* Section label */}
          <div className="mb-8">
            <span className="text-caption text-white/30 contact-text opacity-0 block tracking-widest">
              Contact
            </span>
          </div>

          {/* Massive email - main element */}
          <div 
            ref={emailContainerRef}
            className="overflow-visible mb-12"
          >
            <a
              ref={emailRef}
              href={`mailto:${email}`}
              className="inline-block group"
              onMouseEnter={() => {
                setIsHovering(true);
                playHoverSound();
              }}
              onMouseLeave={() => setIsHovering(false)}
              style={{ willChange: 'transform' }}
            >
              <span className="block text-[clamp(2rem,10vw,8rem)] font-medium leading-[0.9] tracking-tight">
                {email.split('').map((char, i) => (
                  <span 
                    key={i} 
                    className={`email-char inline-block opacity-0 transition-colors duration-200 ${
                      isHovering ? 'text-mustard' : 'text-white'
                    }`}
                    style={{ 
                      transitionDelay: `${i * 15}ms`,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {char === '@' ? (
                      <span className="text-white/30 group-hover:text-mustard/50 transition-colors duration-200">@</span>
                    ) : char === '.' ? (
                      <span className="text-white/30 group-hover:text-mustard/50 transition-colors duration-200">.</span>
                    ) : (
                      char
                    )}
                  </span>
                ))}
              </span>
              
              {/* Mustard underline on hover */}
              <span 
                className={`block h-[2px] bg-mustard mt-4 transition-all duration-500 ease-out origin-left ${
                  isHovering ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </a>
          </div>

          {/* Supporting text */}
          <p className="text-body text-white/40 max-w-md mb-20 contact-text opacity-0">
            Currently accepting new projects for Q1 2025. 
            Let&apos;s create something extraordinary together.
          </p>

          {/* Bottom row: availability + social links */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
            {/* Availability indicator */}
            <div className="contact-text opacity-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-mustard animate-pulse-subtle" />
                <span className="text-mono text-xs text-white tracking-wider uppercase">Available for work</span>
              </div>
              <span className="text-mono text-xs text-white/30">Based in San Francisco, CA</span>
            </div>

            {/* Social links - clustered subtly */}
            <div className="flex items-center gap-6">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link text-mono text-xs text-white/30 hover:text-mustard transition-colors duration-300 opacity-0 tracking-wider uppercase"
                  onMouseEnter={playHoverSound}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-white/5" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-white/5" />
      </section>

      {/* Footer with sound toggle */}
      <footer className="bg-black border-t border-white/5 py-6 section-padding">
        <div className="container-wide flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Copyright */}
          <span className="text-mono text-xs text-white/20">
            © {new Date().getFullYear()} Parrv. All rights reserved.
          </span>

          {/* Sound toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                // Play a quick sound to confirm
                try {
                  const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();
                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  oscillator.frequency.value = 660;
                  oscillator.type = 'sine';
                  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
                  oscillator.start(audioContext.currentTime);
                  oscillator.stop(audioContext.currentTime + 0.15);
                } catch {
                  // Audio not supported
                }
              }
            }}
            className="flex items-center gap-2 text-mono text-xs text-white/20 hover:text-white/40 transition-colors duration-300 group"
          >
            {/* Sound icon */}
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none"
              className="transition-colors duration-300"
            >
              {soundEnabled ? (
                <>
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M19.07 5.93C20.9447 7.80528 21.9979 10.3478 21.9979 13C21.9979 15.6522 20.9447 18.1947 19.07 20.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
            <span className="uppercase tracking-wider">
              Sound {soundEnabled ? 'On' : 'Off'}
            </span>
          </button>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-mono text-xs text-white/20 hover:text-mustard transition-colors duration-300 flex items-center gap-2"
          >
            <span className="uppercase tracking-wider">Back to top</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </footer>
    </>
  );
}