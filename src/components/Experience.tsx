'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

const education = {
  degree: 'Bachelor of Technology (Artificial Intelligence)',
  period: '2024 - 2028',
  institution: 'Newton School of Technology, Rishihood University',
};

const internships = [
  {
    role: 'Frontend and Automation Engineer',
    period: 'May 2025 - July 2025',
    company: 'Hecta',
    location: 'Noida, Uttar Pradesh',
    link: 'https://tinyurl.com/HectaIntern',
    highlights: [
      'Automated the newspaper upload workflow, reducing manual effort by 80%',
      'Implemented web scraping tools and OCR scripts for content extraction',
      'Enhanced website UI and analytics dashboards for improved accuracy',
    ],
    tech: ['Python', 'React', 'Selenium', 'OCR'],
  },
];

const projects = [
  {
    name: 'AayrishAI',
    date: 'May 2025',
    github: 'https://github.com/ParrvLuthra22/AayrishAI',
    demo: '#',
    description: 'Cross-platform AI assistant for automating system and web tasks',
    highlights: [
      'Integrated voice interface, PyQt6 GUI, and NLP models',
      'Used asynchronous programming for real-time performance',
    ],
    tech: ['Python', 'PyQt6', 'NLP', 'AsyncIO', 'REST APIs'],
  },
  {
    name: 'FoodKhoj',
    date: 'April 2025',
    github: 'https://github.com/ParrvLuthra22/FoodKhoj',
    demo: '#',
    description: 'Responsive frontend for food delivery and tracking',
    highlights: [
      'Live APIs for real-time order tracking and visualization',
      'Interactive map-based UI using Leaflet',
    ],
    tech: ['React', 'Tailwind CSS', 'Leaflet', 'REST APIs'],
  },
];

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Title animation
            anime({
              targets: '.experience-title .char',
              translateY: [80, 0],
              opacity: [0, 1],
              easing: 'easeOutExpo',
              duration: 1000,
              delay: anime.stagger(40),
            });

            // Cards stagger in
            anime({
              targets: '.experience-card',
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const titleText = "EXPERIENCE";

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-black relative"
    >
      <div className="container-wide">
        {/* Header */}
        <div className="mb-20">
          <span className="text-caption text-white/30 block mb-4 tracking-widest">Background</span>
          <h2 className="experience-title text-headline overflow-hidden text-white">
            {titleText.split('').map((char, i) => (
              <span key={i} className="char inline-block opacity-0">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Education & Internship */}
          <div className="space-y-12">
            {/* Education */}
            <div className="experience-card opacity-0">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-mono text-mustard text-xs tracking-wider">01</span>
                <span className="text-caption text-white/50">Education</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              
              <h3 className="text-title text-white mb-2">{education.degree}</h3>
              <p className="text-body text-white/50 mb-4">{education.institution}</p>
              <span className="text-mono text-white/30 text-xs">{education.period}</span>
            </div>

            {/* Internship */}
            {internships.map((intern, index) => (
              <div key={index} className="experience-card opacity-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-mono text-mustard text-xs tracking-wider">02</span>
                  <span className="text-caption text-white/50">Internship</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <h3 className="text-title text-white mb-1">{intern.role}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <a 
                    href={intern.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body text-mustard hover:underline"
                    data-cursor="link"
                  >
                    {intern.company}
                  </a>
                  <span className="text-white/30">•</span>
                  <span className="text-body text-white/30">{intern.location}</span>
                </div>
                <span className="text-mono text-white/30 text-xs block mb-6">{intern.period}</span>

                <ul className="space-y-2 mb-6">
                  {intern.highlights.map((highlight, i) => (
                    <li key={i} className="text-body text-white/50 flex items-start gap-3">
                      <span className="text-mustard mt-2">→</span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {intern.tech.map((t, i) => (
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

          {/* Right Column - Projects */}
          <div className="space-y-12">
            <div className="flex items-center gap-3 mb-6 experience-card opacity-0">
              <span className="text-mono text-mustard text-xs tracking-wider">03</span>
              <span className="text-caption text-white/50">Featured Projects</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {projects.map((project, index) => (
              <div 
                key={index} 
                className="experience-card opacity-0 p-6 border border-white/10 hover:border-mustard/30 transition-colors duration-500 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-title text-white group-hover:text-mustard transition-colors duration-300">
                      {project.name}
                    </h3>
                    <span className="text-mono text-white/30 text-xs">{project.date}</span>
                  </div>
                  <div className="flex gap-3">
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

                <p className="text-body text-white/50 mb-4">{project.description}</p>

                <ul className="space-y-2 mb-6">
                  {project.highlights.map((highlight, i) => (
                    <li key={i} className="text-body text-white/40 flex items-start gap-3 text-sm">
                      <span className="text-white/20 mt-1">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t, i) => (
                    <span 
                      key={i}
                      className="text-mono text-xs px-2 py-0.5 bg-white/5 text-white/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
