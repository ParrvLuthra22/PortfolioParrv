'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

const projects = [
  {
    id: 1,
    title: 'Nebula',
    category: 'Brand Identity',
    year: '2024',
    size: 'large',
  },
  {
    id: 2,
    title: 'Cipher',
    category: 'Web Application',
    year: '2024',
    size: 'medium',
  },
  {
    id: 3,
    title: 'Flux',
    category: 'Interactive Experience',
    year: '2023',
    size: 'medium',
  },
  {
    id: 4,
    title: 'Aether',
    category: 'E-Commerce',
    year: '2023',
    size: 'small',
  },
  {
    id: 5,
    title: 'Prism',
    category: 'Mobile App',
    year: '2023',
    size: 'small',
  },
  {
    id: 6,
    title: 'Vertex',
    category: 'Dashboard',
    year: '2023',
    size: 'large',
  },
];

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.work-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });

            anime({
              targets: '.work-tile',
              clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
              easing: 'easeOutExpo',
              duration: 1200,
              delay: anime.stagger(100, { start: 300 }),
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const titleText = "SELECTED WORK";

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'large':
        return 'col-span-2 row-span-2 aspect-square md:aspect-auto md:h-[600px]';
      case 'medium':
        return 'col-span-1 row-span-2 aspect-[3/4]';
      case 'small':
        return 'col-span-1 row-span-1 aspect-square';
      default:
        return 'col-span-1 row-span-1 aspect-square';
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="section-padding bg-black"
    >
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <span className="text-caption text-white/50 block mb-4">Portfolio</span>
            <h2 className="work-title text-headline overflow-hidden text-white">
              {titleText.split('').map((char, i) => (
                <span key={i} className="char inline-block opacity-0">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h2>
          </div>
          
          <p className="text-body text-white/50 mt-6 md:mt-0 md:max-w-md">
            A curated selection of projects spanning brand identity, web development, and interactive experiences.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {projects.map((project) => (
            <a 
              key={project.id}
              href={`/work/${project.id}`}
              className={`work-tile ${getSizeClasses(project.size)} block relative overflow-hidden group bg-black border border-white/10`}
              style={{ clipPath: 'inset(100% 0 0 0)' }}
              data-cursor="link"
            >
              <div className="absolute inset-0 bg-white/5" />

              <div className="work-tile-overlay absolute inset-0 bg-black opacity-0 group-hover:opacity-80 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-mono text-mustard">{project.category}</span>
                  <span className="text-mono text-white/50">— {project.year}</span>
                </div>
                <h3 className="text-title text-white">{project.title}</h3>
              </div>

              <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          ))}
        </div>

        <div className="flex justify-center mt-16">
          <button 
            className="magnetic-btn"
            data-magnetic
          >
            <span>View All Projects</span>
          </button>
        </div>
      </div>
    </section>
  );
}