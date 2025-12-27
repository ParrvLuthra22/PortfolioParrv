'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.email-char',
              translateY: [100, 0],
              rotateZ: [15, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(30, { start: 200 }),
            });

            anime({
              targets: '.contact-text',
              translateY: [30, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 800,
              delay: anime.stagger(100, { start: 800 }),
            });

            anime({
              targets: '.social-link',
              translateX: [-20, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 600,
              delay: anime.stagger(80, { start: 1200 }),
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

  useEffect(() => {
    const email = emailRef.current;
    if (!email) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = email.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      anime({
        targets: email,
        translateX: x * 0.1,
        translateY: y * 0.1,
        duration: 300,
        easing: 'easeOutQuad',
      });
    };

    const handleMouseLeave = () => {
      anime({
        targets: email,
        translateX: 0,
        translateY: 0,
        duration: 600,
        easing: 'easeOutElastic(1, 0.5)',
      });
    };

    email.addEventListener('mousemove', handleMouseMove);
    email.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      email.removeEventListener('mousemove', handleMouseMove);
      email.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const email = "hello@parrv.dev";
  const socials = [
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
    { name: 'Dribbble', url: 'https://dribbble.com' },
  ];

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center section-padding bg-black relative overflow-hidden"
    >
      <div className="container-wide">
        <div className="mb-12">
          <span className="text-caption text-white/50 contact-text opacity-0 block">
            Get in Touch
          </span>
        </div>

        <div className="overflow-hidden mb-16">
          <a
            ref={emailRef}
            href={`mailto:${email}`}
            className="text-display block leading-none group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            data-cursor="link"
          >
            {email.split('').map((char, i) => (
              <span 
                key={i} 
                className={`email-char inline-block opacity-0 transition-colors duration-300 ${
                  isHovering ? 'text-mustard' : 'text-white'
                }`}
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                {char}
              </span>
            ))}
          </a>
        </div>

        <p className="text-body text-white/50 max-w-lg mb-16 contact-text opacity-0">
          Currently accepting new projects for Q1 2025. 
          Let&apos;s create something extraordinary together.
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
          <div className="contact-text opacity-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-mustard animate-pulse" />
              <span className="text-mono text-white">Available for work</span>
            </div>
            <span className="text-mono text-white/50">Based in San Francisco, CA</span>
          </div>

          <div className="flex flex-wrap gap-8">
            {socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link link-underline text-body text-white/50 hover:text-white transition-colors duration-300 opacity-0"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none">
        <span className="text-[20vw] font-medium leading-none text-white/5 block text-center translate-y-1/3">
          CONNECT
        </span>
      </div>

      <div className="absolute top-8 right-8 w-24 h-24 border-t border-r border-white/10" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-b border-l border-white/10" />
    </section>
  );
}