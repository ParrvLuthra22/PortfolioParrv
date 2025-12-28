'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';


// All main projects (show all 4 on main screen)
const projects = [
  {
    name: 'upSosh',
    date: 'December 2024',
    github: 'https://github.com/ParrvLuthra22/upSosh',
    demo: 'https://upsosh.vercel.app',
    description: 'Full-stack event booking platform built in under 18 days enabling users to create, discover, and book events',
    highlights: [
      'Built complete authentication system and real-time event management dashboard',
      'Integrated DodoPayments gateway for secure transactions and revenue tracking',
      'Implemented RESTful API with PostgreSQL optimization for concurrent bookings',
    ],
    tech: ['Next.js', 'Express.js', 'PostgreSQL', 'DodoPayments', 'REST APIs'],
  },
  {
    name: 'FoodKhoj',
    date: 'April 2025',
    github: 'https://github.com/ParrvLuthra22/FoodKhoj',
    demo: 'https://foodkhoj.vercel.app',
    description: 'Responsive frontend for food delivery and tracking with real-time visualization',
    highlights: [
      'Live APIs for real-time order tracking and delivery visualization',
      'Interactive map-based UI using React and Leaflet',
    ],
    tech: ['React', 'Tailwind CSS', 'Leaflet', 'REST APIs'],
  },
  {
    name: 'TuneMate',
    date: 'Nov-Dec 2024',
    github: 'https://github.com/ParrvLuthra22/TuneMate',
    demo: 'https://music-match-seven.vercel.app/',
    description: 'Music-based dating application that matches users based on Spotify listening habits and suggests concert dates',
    highlights: [
      'Integrated Spotify API for analyzing top artists/genres and Ticketmaster API for concert discovery',
      'Built real-time chat with Socket.io and collaborative playlist creation',
      'Implemented music compatibility algorithm with match highlights dashboard',
    ],
    tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Spotify API', 'Ticketmaster API'],
  },
  {
    name: 'AayrishAI',
    date: 'May 2025',
    github: 'https://github.com/ParrvLuthra22/AayrishAI',
    demo: 'https://aayrishai.vercel.app',
    description: 'Cross-platform AI assistant for automating system and web tasks',
    highlights: [
      'Integrated voice interface, PyQt6 GUI, and NLP models for conversational interactions',
      'Used asynchronous programming and API integrations for real-time performance',
    ],
    tech: ['Python', 'PyQt6', 'NLP', 'AsyncIO', 'REST APIs'],
  },
];

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Title animation on section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            anime({
              targets: '.work-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });

            // Project cards stagger in
            anime({
              targets: '.project-card',
              translateY: [60, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 800,
              delay: anime.stagger(150, { start: 400 }),
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

  // Animate new projects when expanded
  useEffect(() => {
    if (showAllProjects) {
      anime({
        targets: '.all-project-card',
        translateY: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(100),
      });
    }
  }, [showAllProjects]);

  const titleText = "WORK";

  return (
    <section 
      ref={sectionRef}
      className="section-padding bg-black relative"
    >
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <span className="text-caption text-white/30 block mb-4 tracking-widest">Projects</span>
            <h2 className="work-title text-headline overflow-hidden text-white">
              {titleText.split('').map((char, i) => (
                <span key={i} className="char inline-block opacity-0">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h2>
          </div>
          
          <p className="text-body text-white/50 mt-6 md:mt-0 md:max-w-md">
            A curated selection of projects spanning full-stack development, AI, and interactive experiences.
          </p>
        </div>

        {/* Projects Grid - show all 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="project-card opacity-0 p-8 border border-white/10 hover:border-mustard/30 transition-colors duration-500 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-title text-white group-hover:text-mustard transition-colors duration-300">
                    {project.name}
                  </h3>
                  <span className="text-mono text-white/30 text-xs">{project.date}</span>
                </div>
                <div className="flex gap-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mono text-xs text-white/30 hover:text-mustard transition-colors duration-300"
                    data-cursor="link"
                  >
                    GitHub
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mono text-xs text-white/30 hover:text-mustard transition-colors duration-300"
                    data-cursor="link"
                  >
                    Demo
                  </a>
                </div>
              </div>

              <p className="text-body text-white/50 mb-6">{project.description}</p>

              <ul className="space-y-2 mb-6">
                {project.highlights.map((highlight, i) => (
                  <li key={i} className="text-body text-white/40 flex items-start gap-3 text-sm">
                    <span className="text-mustard mt-1">→</span>
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((t, i) => (
                  <span 
                    key={i}
                    className="text-mono text-xs px-3 py-1 border border-white/10 text-white/40"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}