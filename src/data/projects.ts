// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = 'ai-ml' | 'fullstack' | 'frontend' | 'mobile' | 'dataviz';

export type TechFamily = 'ai' | 'frontend' | 'backend' | 'database' | 'default';

export interface Project {
  id: string;
  title: string;
  category: Category;
  description: string;
  longDescription: string;
  tech: string[];
  githubUrl: string;
  demoUrl: string;
  date: string;
  highlights: string[];
  accentColor: string;
  gradient: string;
}

// ─── Category metadata ────────────────────────────────────────────────────────

export const CATEGORIES: Array<{ key: Category | 'all'; label: string }> = [
  { key: 'all',       label: 'All'        },
  { key: 'ai-ml',     label: 'AI / ML'    },
  { key: 'fullstack', label: 'FullStack'  },
  { key: 'frontend',  label: 'Frontend'   },
  { key: 'dataviz',   label: 'Data Viz'   },
  { key: 'mobile',    label: 'Mobile'     },
];

// ─── Tech-family classifier ───────────────────────────────────────────────────

const AI_TECH = new Set([
  'LangChain', 'LangGraph', 'Groq', 'Llama 3.1', 'Gemini API',
  'Vosk', 'Whisper', 'Kokoro', 'Tavily', 'ChromaDB',
  'NLP', 'PyQt6', 'AsyncIO', 'Streamlit', 'TensorFlow', 'PyTorch',
  'BeautifulSoup', 'Tesseract OCR', 'Selenium',
]);

const FRONTEND_TECH = new Set([
  'React', 'Next.js', 'Tailwind CSS', 'HTML', 'CSS', 'Vue', 'Svelte',
  'Leaflet', 'Anime.js', 'TypeScript', 'JavaScript',
]);

const BACKEND_TECH = new Set([
  'Node.js', 'FastAPI', 'Express.js', 'Python', 'FastAPI',
  'Socket.io', 'REST APIs', 'JWT', 'OAuth', 'DodoPayments',
  'Vercel', 'Railway', 'Prisma ORM',
]);

const DATABASE_TECH = new Set([
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite',
  'ChromaDB', 'Prisma ORM', 'Supabase',
]);

export function categorizeTech(tech: string): TechFamily {
  if (AI_TECH.has(tech))       return 'ai';
  if (FRONTEND_TECH.has(tech)) return 'frontend';
  if (DATABASE_TECH.has(tech)) return 'database';
  if (BACKEND_TECH.has(tech))  return 'backend';
  return 'default';
}

// ─── Project data ─────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  // ── AI / ML ──────────────────────────────────────────────────────────────
  {
    id: 'friday',
    title: 'Friday',
    category: 'ai-ml',
    description: 'Modular macOS AI assistant with multi-agent pub/sub architecture',
    longDescription:
      'Built a modular, event-driven macOS assistant using a multi-agent pub/sub architecture — orchestrator + 5 specialised agents — with a fully offline voice stack: Vosk wake-word detection, Whisper STT, and Kokoro neural TTS.',
    tech: ['Python', 'LangGraph', 'Gemini API', 'Vosk', 'Whisper', 'Kokoro', 'ChromaDB', 'FastAPI'],
    githubUrl: 'https://github.com/parrv',
    demoUrl: '',
    date: 'Jan 2026',
    highlights: [
      'Multi-agent pub/sub with LangGraph conditional edges and tool routing',
      'Full macOS automation: iMessage, Safari, Finder, Calendar, Spotify via AppleScript',
      'RAG memory with ChromaDB + semantic retrieval',
      'Real-time HUD overlay + face authentication + FastAPI health endpoint',
    ],
    accentColor: '#FFB800',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #0d1117 50%, #0a1628 100%)',
  },
  {
    id: 'mmas',
    title: 'MMAS',
    category: 'ai-ml',
    description: 'Multi-Model Agent System — 4-agent research pipeline completing in under 12s',
    longDescription:
      'Architected a 4-agent research pipeline (Search → Reader → Writer → Critic) using LangChain orchestration. Each agent is specialised with distinct tools and a single responsibility.',
    tech: ['Python', 'LangChain', 'Groq', 'Llama 3.1', 'Tavily', 'BeautifulSoup', 'Streamlit'],
    githubUrl: '',
    demoUrl: '',
    date: 'Apr 2025',
    highlights: [
      'Search → Reader → Writer → Critic pipeline with LangChain',
      'Tavily API + BeautifulSoup for real-time web search and structured extraction',
      'Groq Llama 3.1 for inference, report generation, and critique scoring',
      'Full pipeline completes in under 12 seconds',
    ],
    accentColor: '#A78BFA',
    gradient: 'linear-gradient(135deg, #0f0a1e 0%, #0d1117 50%, #1a0f0a 100%)',
  },

  // ── Full-Stack ────────────────────────────────────────────────────────────
  {
    id: 'creatorlyff',
    title: 'CreatorLyff',
    category: 'fullstack',
    description: 'Full-stack creator marketplace — brands discover and collaborate with creators',
    longDescription:
      'Built a full-stack creator marketplace platform enabling brands to discover and collaborate with creators through structured proposals — replacing unstructured DM-based outreach entirely.',
    tech: ['TypeScript', 'Node.js', 'MongoDB', 'Socket.io', 'JWT', 'OAuth', 'React'],
    githubUrl: '',
    demoUrl: '',
    date: 'Jan 2026',
    highlights: [
      'Role-based workflows with proposal management and status tracking',
      'Real-time in-app chat via Socket.io',
      'Secure auth: JWT + Facebook OAuth',
      'Real-time dashboards for collaboration activity',
    ],
    accentColor: '#34D399',
    gradient: 'linear-gradient(135deg, #0a1e14 0%, #0d1117 50%, #0a1628 100%)',
  },
  {
    id: 'upsosh',
    title: 'upSosh',
    category: 'fullstack',
    description: 'Micro-event booking platform with payment integration and real-time dashboards',
    longDescription:
      'Built a full-stack micro-event platform enabling users to create, discover, and book events with secure authentication, real-time dashboards, and DodoPayments integration.',
    tech: ['TypeScript', 'Node.js', 'PostgreSQL', 'Prisma ORM', 'DodoPayments', 'Vercel', 'Railway'],
    githubUrl: '',
    demoUrl: '',
    date: 'Dec 2025',
    highlights: [
      'Concurrent booking handling with optimised relational data via Prisma ORM',
      'DodoPayments integration with secure checkout flow',
      'Deployed on Vercel + Railway across multiple production iterations',
      'REST APIs optimised for concurrent bookings',
    ],
    accentColor: '#60A5FA',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #0d1117 50%, #1a0a0a 100%)',
  },

  // ── Frontend ──────────────────────────────────────────────────────────────
  {
    id: 'hecta',
    title: 'Hecta — Frontend & Automation',
    category: 'frontend',
    description: 'Rebuilt editorial dashboards and automated newspaper ingestion pipeline',
    longDescription:
      'Interned as Frontend & Automation Engineer at Hecta. Automated the full newspaper upload workflow end-to-end, cutting manual effort by 80%. Rebuilt analytics dashboards in React that directly informed editorial decisions.',
    tech: ['Python', 'React', 'Selenium', 'Tesseract OCR', 'Tailwind CSS'],
    githubUrl: '',
    demoUrl: '',
    date: 'May–Jul 2025',
    highlights: [
      'Automated end-to-end newspaper ingestion: scrape → extract → classify',
      '80% reduction in manual editorial workflow effort',
      'Rebuilt analytics dashboards improving data accuracy',
      'OCR pipeline using Selenium + Tesseract',
    ],
    accentColor: '#F59E0B',
    gradient: 'linear-gradient(135deg, #1a1200 0%, #0d1117 50%, #0a1628 100%)',
  },
];

// ─── Empty placeholder categories ────────────────────────────────────────────
// 'mobile' and 'dataviz' are intentionally empty — UI renders "coming soon" state.
export const EMPTY_CATEGORIES: Category[] = ['mobile', 'dataviz'];
