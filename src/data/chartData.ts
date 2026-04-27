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
    pillLabel: 'Uber Analysis',
    color: '#FFB800',
    accentColor: '#FFD060',
    gradient: ['#1a1200', '#2e1e00'],
    points: [
      { label: 'Surge',   value: 88, raw: '2.4× peak'    },
      { label: 'Wait',    value: 62, raw: '4.2 min avg'  },
      { label: 'Rating',  value: 94, raw: '4.87 / 5'     },
      { label: 'Cancel',  value: 28, raw: '12% rate'     },
      { label: 'Revenue', value: 81, raw: '$2.1M/mo'     },
      { label: 'Drivers', value: 73, raw: '18k active'   },
    ],
    project: {
      name: 'Uber Data Analysis',
      date: '2025',
      github: '',
      demo: '',
      description: 'End-to-end exploratory data analysis of Uber ride data — uncovering surge patterns, driver behaviour, and revenue trends across a 6-month dataset.',
      tech: ['Python', 'Pandas', 'Seaborn', 'Matplotlib', 'Jupyter'],
      highlights: [
        'Surge pricing pattern detection across 500k+ trips',
        'Driver efficiency scoring with heatmap visualisation',
        'Revenue trend analysis with seasonality decomposition',
      ],
    },
  },
  {
    type: 'line',
    pillLabel: 'FraudGuard',
    color: '#34D399',
    accentColor: '#6EE7B7',
    gradient: ['#001a12', '#002a1e'],
    points: [
      { label: 'Jan', value: 92, raw: '0.8% FPR'  },
      { label: 'Feb', value: 85, raw: '1.2% FPR'  },
      { label: 'Mar', value: 96, raw: '0.5% FPR'  },
      { label: 'Apr', value: 78, raw: '1.8% FPR'  },
      { label: 'May', value: 98, raw: '0.3% FPR'  },
      { label: 'Jun', value: 99, raw: '0.1% FPR'  },
    ],
    project: {
      name: 'FraudGuard',
      date: '2025',
      github: '',
      demo: '',
      description: 'ML-based credit card fraud detection system achieving 99% precision with adaptive threshold tuning and real-time scoring pipeline.',
      tech: ['Python', 'Scikit-learn', 'XGBoost', 'SHAP', 'FastAPI'],
      highlights: [
        '99% precision on held-out test set with 0.1% FPR',
        'SHAP explainability for auditor-ready fraud reports',
        'Real-time inference API scoring 10k transactions/sec',
      ],
    },
  },
  {
    type: 'scatter',
    pillLabel: 'Coming Soon',
    color: 'rgba(255,255,255,0.2)',
    accentColor: 'rgba(255,255,255,0.15)',
    gradient: ['#0d0d0d', '#111111'],
    points: [
      { label: 'TBD', value: 0, raw: '—' },
      { label: 'TBD', value: 0, raw: '—' },
      { label: 'TBD', value: 0, raw: '—' },
      { label: 'TBD', value: 0, raw: '—' },
    ],
    project: {
      name: 'Coming Soon',
      date: '—',
      github: '',
      demo: '',
      description: 'Another data visualisation project is in the works. Check back soon.',
      tech: [],
      highlights: [],
    },
  },
  {
    type: 'radial',
    pillLabel: 'Coming Soon',
    color: 'rgba(255,255,255,0.2)',
    accentColor: 'rgba(255,255,255,0.15)',
    gradient: ['#0d0d0d', '#111111'],
    points: [
      { label: 'TBD', value: 25, raw: '—' },
      { label: 'TBD', value: 25, raw: '—' },
      { label: 'TBD', value: 25, raw: '—' },
      { label: 'TBD', value: 25, raw: '—' },
    ],
    project: {
      name: 'Coming Soon',
      date: '—',
      github: '',
      demo: '',
      description: 'Another data visualisation project is in the works. Check back soon.',
      tech: [],
      highlights: [],
    },
  },
];

export const CHART_COLORS: Record<ChartType, string> = {
  bar:     '#D4A030',
  line:    '#88CCEE',
  scatter: '#77DD77',
  radial:  '#FF8FA3',
};
