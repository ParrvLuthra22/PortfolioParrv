// ─── Types ────────────────────────────────────────────────────────────────────

export interface NodeDef {
  id: NodeId;
  label: string;
  sublabel: string;
  cx: number;
  cy: number;
  color: string;
  glowColor: string;
  project: ProjectDef;
}

export interface PathDef {
  id: string;
  from: NodeId;
  to: NodeId;
  d: string;
  length: number; // approximate pixel length for timing
}

export interface ProjectDef {
  name: string;
  date: string;
  layer: string;
  description: string;
  highlights: string[];
  tech: string[];
  github: string;
  demo: string;
}

export interface PacketState {
  id: string;
  type: PacketType;
  pathIndex: number;        // index into PATHS array
  progress: number;         // 0–1 along current path
  label: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  isReturn: boolean;
  x: number;
  y: number;
  opacity: number;
}

export interface NodeState {
  id: NodeId;
  scale: number;
  opacity: number;
  isSelected: boolean;
}

export interface FlowConfig {
  maxPackets: number;
  spawnInterval: number;   // ms
  packetSpeed: number;     // progress-per-frame (approx)
}

export type NodeId = 'client' | 'api' | 'server' | 'db';
export type PacketType = 'get' | 'post' | 'error';

// ─── SVG Viewport ─────────────────────────────────────────────────────────────

export const SVG_WIDTH = 800;
export const SVG_HEIGHT = 260;

// ─── Nodes ────────────────────────────────────────────────────────────────────

export const NODES: NodeDef[] = [
  {
    id: 'client',
    label: 'CLIENT',
    sublabel: 'Browser / App',
    cx: 80,
    cy: 130,
    color: '#D4A030',
    glowColor: '#D4A030',
    project: {
      name: 'FoodKhoj',
      date: 'April 2025',
      layer: 'Client Layer',
      description: 'Responsive frontend for food delivery and tracking with real-time visualization.',
      highlights: [
        'Live APIs for real-time order tracking and delivery visualization',
        'Interactive map-based UI using React and Leaflet',
        'Mobile-first, accessible design with responsive layouts',
      ],
      tech: ['React', 'Tailwind CSS', 'Leaflet', 'REST APIs'],
      github: 'https://github.com/ParrvLuthra22/FoodKhoj',
      demo: 'https://food-khoj.vercel.app',
    },
  },
  {
    id: 'api',
    label: 'API GATEWAY',
    sublabel: 'REST / GraphQL',
    cx: 293,
    cy: 130,
    color: '#88CCEE',
    glowColor: '#88CCEE',
    project: {
      name: 'upSosh',
      date: 'December 2024',
      layer: 'API Gateway Layer',
      description: 'Full-stack event booking platform with a RESTful API layer powering auth, bookings, and payments.',
      highlights: [
        'RESTful API with rate limiting and JWT auth middleware',
        'Integrated DodoPayments gateway for secure transactions',
        'Concurrent booking handling with PostgreSQL row-level locking',
      ],
      tech: ['Express.js', 'REST APIs', 'JWT', 'PostgreSQL'],
      github: 'https://github.com/ParrvLuthra22/upSosh',
      demo: 'https://upsosh.app',
    },
  },
  {
    id: 'server',
    label: 'SERVER',
    sublabel: 'Node / Python',
    cx: 507,
    cy: 130,
    color: '#77DD77',
    glowColor: '#77DD77',
    project: {
      name: 'TuneMate',
      date: 'Nov–Dec 2024',
      layer: 'Server Layer',
      description: 'Music-based dating app backend with real-time WebSocket chat and Spotify/Ticketmaster integrations.',
      highlights: [
        'Real-time chat with Socket.io and collaborative playlists',
        'Music compatibility algorithm with match scoring',
        'Integrated Spotify API and Ticketmaster API',
      ],
      tech: ['Node.js', 'Express.js', 'Socket.io', 'Spotify API'],
      github: 'https://github.com/ParrvLuthra22/musicMatch',
      demo: 'https://music-match-bay.vercel.app',
    },
  },
  {
    id: 'db',
    label: 'DATABASE',
    sublabel: 'Postgres / Mongo',
    cx: 720,
    cy: 130,
    color: '#FF6B6B',
    glowColor: '#FF6B6B',
    project: {
      name: 'AayrishAI',
      date: 'May 2025',
      layer: 'Data / AI Layer',
      description: 'Cross-platform AI assistant for automating tasks, backed by NLP models and async state management.',
      highlights: [
        'NLP-driven intent recognition and voice interface',
        'Async task execution with robust error recovery',
        'PyQt6 GUI with real-time feedback and logging',
      ],
      tech: ['Python', 'PyQt6', 'NLP', 'AsyncIO', 'REST APIs'],
      github: 'https://github.com/ParrvLuthra22/AayrishAI',
      demo: 'https://drive.google.com/file/d/1C74ye46t0seS3kq8oCgCTmahsE79RGgb/view?usp=sharing',
    },
  },
];

// ─── Paths ────────────────────────────────────────────────────────────────────

export const PATHS: PathDef[] = [
  {
    id: 'client-api',
    from: 'client',
    to: 'api',
    d: 'M 112 130 C 160 130, 210 130, 258 130',
    length: 213,
  },
  {
    id: 'api-server',
    from: 'api',
    to: 'server',
    d: 'M 328 130 C 376 130, 420 130, 472 130',
    length: 213,
  },
  {
    id: 'server-db',
    from: 'server',
    to: 'db',
    d: 'M 542 130 C 590 130, 638 130, 685 130',
    length: 213,
  },
];

// ─── Packet Config ─────────────────────────────────────────────────────────────

export const FLOW_CONFIG: FlowConfig = {
  maxPackets: 5,
  spawnInterval: 1500,
  packetSpeed: 0.008,
};

export const PACKET_TYPES: { type: PacketType; color: string; weight: number }[] = [
  { type: 'get',   color: '#D4A030', weight: 0.6 },
  { type: 'post',  color: '#FFFFFF', weight: 0.3 },
  { type: 'error', color: '#FF6B6B', weight: 0.1 },
];

export const MOCK_ENDPOINTS = [
  { method: 'GET',    path: '/api/v2/events',     status: 200, time: 42  },
  { method: 'POST',   path: '/api/v2/bookings',   status: 201, time: 87  },
  { method: 'GET',    path: '/api/v2/user/me',    status: 200, time: 28  },
  { method: 'POST',   path: '/api/v2/auth/login', status: 200, time: 134 },
  { method: 'GET',    path: '/api/v2/matches',    status: 200, time: 56  },
  { method: 'GET',    path: '/api/v2/tracks',     status: 500, time: 203 },
  { method: 'DELETE', path: '/api/v2/session',    status: 204, time: 19  },
];
