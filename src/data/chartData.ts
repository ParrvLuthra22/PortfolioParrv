// ─── Chart Types ──────────────────────────────────────────────────────────────

export type ChartType = 'bar' | 'line' | 'scatter' | 'radial';

export interface DataPoint {
  label: string;
  value: number;      // 0–100 normalised
  raw: string;        // Display value (e.g. "4.2k stars")
}

export interface ChartDataset {
  type: ChartType;
  pillLabel: string;
  color: string;
  accentColor: string;
  gradient: [string, string];  // CSS gradient from/to
  points: DataPoint[];
  project: ProjectSnippet;
}

export interface ProjectSnippet {
  name: string;
  date: string;
  github: string;
  demo: string;
  description: string;
  tech: string[];
  highlights: string[];
}

// ─── Datasets ─────────────────────────────────────────────────────────────────

export const CHART_DATASETS: ChartDataset[] = [
  {
    type: 'bar',
    pillLabel: 'Bar',
    color: '#D4A030',
    accentColor: '#F5C842',
    gradient: ['#1a1200', '#2e1e00'],
    points: [
      { label: 'Perf',    value: 94, raw: '94ms TTI'    },
      { label: 'A11y',    value: 78, raw: '78/100'      },
      { label: 'SEO',     value: 88, raw: '88/100'      },
      { label: 'PWA',     value: 65, raw: '65/100'      },
      { label: 'Load',    value: 82, raw: '1.2s LCP'    },
      { label: 'FID',     value: 91, raw: '16ms FID'    },
    ],
    project: {
      name: 'upSosh Dashboard',
      date: 'December 2024',
      github: 'https://github.com/ParrvLuthra22/upSosh',
      demo: 'https://upsosh.app',
      description: 'Event management dashboard with Lighthouse performance metrics optimized across all Core Web Vitals.',
      tech: ['Next.js', 'Tailwind CSS', 'Lighthouse', 'Chart.js'],
      highlights: [
        '94ms Time-to-Interactive across 4G networks',
        'Optimized LCP, FID, and CLS for Core Web Vitals',
        'PWA-ready with offline fallback and push notification support',
      ],
    },
  },
  {
    type: 'line',
    pillLabel: 'Line',
    color: '#88CCEE',
    accentColor: '#AADDF5',
    gradient: ['#001a22', '#002a38'],
    points: [
      { label: 'Jan', value: 20,  raw: '120 users'   },
      { label: 'Feb', value: 38,  raw: '228 users'   },
      { label: 'Mar', value: 55,  raw: '330 users'   },
      { label: 'Apr', value: 42,  raw: '252 users'   },
      { label: 'May', value: 78,  raw: '468 users'   },
      { label: 'Jun', value: 95,  raw: '570 users'   },
    ],
    project: {
      name: 'TuneMate Growth',
      date: 'Nov–Dec 2024',
      github: 'https://github.com/ParrvLuthra22/musicMatch',
      demo: 'https://music-match-bay.vercel.app',
      description: 'User growth analytics dashboard tracking music-based match app adoption over a 6-month period.',
      tech: ['React', 'Socket.io', 'MongoDB', 'Recharts'],
      highlights: [
        'Real-time user growth from 120 → 570 users in 6 months',
        'Socket.io-driven live event feed with user session graphs',
        'Automated cohort analysis with weekly retention tracking',
      ],
    },
  },
  {
    type: 'scatter',
    pillLabel: 'Scatter',
    color: '#77DD77',
    accentColor: '#99EE99',
    gradient: ['#001200', '#001a00'],
    points: [
      { label: 'React',    value: 85, raw: '142 commits'  },
      { label: 'Node',     value: 62, raw: '98 commits'   },
      { label: 'Next.js',  value: 91, raw: '156 commits'  },
      { label: 'Python',   value: 44, raw: '73 commits'   },
      { label: 'SQL',      value: 71, raw: '118 commits'  },
      { label: 'TS',       value: 88, raw: '147 commits'  },
    ],
    project: {
      name: 'FoodKhoj Map Viz',
      date: 'April 2025',
      github: 'https://github.com/ParrvLuthra22/FoodKhoj',
      demo: 'https://foodkhoj.vercel.app',
      description: 'Technology proficiency scatter map built from commit data across 6 major languages and frameworks.',
      tech: ['React', 'Leaflet', 'D3-lite', 'REST APIs'],
      highlights: [
        'Scatter visualization of 634 total commits across tech stack',
        'Geospatial cluster rendering with Leaflet custom markers',
        'Interactive point-hover with commit diff previews',
      ],
    },
  },
  {
    type: 'radial',
    pillLabel: 'Radial',
    color: '#FF8FA3',
    accentColor: '#FFAAB8',
    gradient: ['#1a0010', '#2a0018'],
    points: [
      { label: 'NLP',      value: 35, raw: '35%' },
      { label: 'Voice',    value: 22, raw: '22%' },
      { label: 'UI',       value: 18, raw: '18%' },
      { label: 'API',      value: 15, raw: '15%' },
      { label: 'Async',    value: 10, raw: '10%' },
    ],
    project: {
      name: 'AayrishAI Breakdown',
      date: 'May 2025',
      github: 'https://github.com/ParrvLuthra22/AayrishAI',
      demo: 'https://drive.google.com/file/d/1C74ye46t0seS3kq8oCgCTmahsE79RGgb/view?usp=sharing',
      description: 'Radial breakdown of AayrishAI codebase by module — NLP pipeline, voice interface, UI, API layer, and async engine.',
      tech: ['Python', 'PyQt6', 'NLP', 'AsyncIO'],
      highlights: [
        'NLP pipeline leads at 35% — intent recognition and slot-filling',
        'Voice + UI together form 40% of the frontend surface area',
        'Async engine handles 100% of I/O-bound task orchestration',
      ],
    },
  },
];

export const CHART_COLORS: Record<ChartType, string> = {
  bar:     '#D4A030',
  line:    '#88CCEE',
  scatter: '#77DD77',
  radial:  '#FF8FA3',
};
