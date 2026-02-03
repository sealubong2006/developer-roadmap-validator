export const CONSTANTS = {
  // Roadmap versioning
  ROADMAP_VERSION: 'v1.0',
  ROADMAP_LAST_UPDATED: '2026-02-01',
  ROADMAP_SOURCE: 'roadmap.sh',
  ROADMAP_SOURCE_URL: 'https://roadmap.sh',

  // Tracks
  TRACKS: {
    FRONTEND: 'frontend',
    BACKEND: 'backend',
    FULLSTACK: 'fullstack'
  },

  // Proficiency levels
  PROFICIENCY_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    STRONG: 'strong'
  },

  // Sorting options
  SORT_OPTIONS: {
    IMPACT: 'impact',
    DEMAND: 'demand',
    LEARNING_ORDER: 'learning_order',
    QUICK_WINS: 'quick_wins'
  },

  // Demand categories
  DEMAND_CATEGORIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },

  // Demand thresholds for categorization
  DEMAND_THRESHOLDS: {
    HIGH: 1000,      // Combined score >= 1000
    MEDIUM: 300      // Combined score >= 300 and < 1000
  },

  // Time windows for demand analysis
  DEMAND_WINDOW_MONTHS: 6,
  
  // Cache configuration
  CACHE: {
    DEFAULT_TTL_HOURS: 12,
    MAX_SIZE: 100,
    MIN_TTL_HOURS: 6,
    MAX_TTL_HOURS: 24
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    MAX_PER_KEY: 50
  },

  // API configuration
  API: {
    GITHUB_BASE_URL: 'https://api.github.com',
    STACKOVERFLOW_BASE_URL: 'https://api.stackexchange.com/2.3',
    GITHUB_RATE_LIMIT_AUTHENTICATED: 5000,
    GITHUB_RATE_LIMIT_UNAUTHENTICATED: 60,
    STACKOVERFLOW_RATE_LIMIT_AUTHENTICATED: 10000,
    STACKOVERFLOW_RATE_LIMIT_UNAUTHENTICATED: 300
  },

  // Chart configuration
  CHARTS: {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 400,
    COLORS: {
      PRIMARY: '#4A90E2',
      SECONDARY: '#F39C12',
      SUCCESS: '#27AE60',
      DANGER: '#E74C3C',
      WARNING: '#F1C40F',
      INFO: '#3498DB',
      GITHUB: '#6e5494',
      STACKOVERFLOW: '#F48024'
    }
  },

  // PDF configuration
  PDF: {
    PAGE_WIDTH: 612,      // Letter size
    PAGE_HEIGHT: 792,
    MARGIN: 50,
    FONT_SIZES: {
      TITLE: 24,
      HEADING: 18,
      SUBHEADING: 14,
      BODY: 11,
      SMALL: 9
    }
  },

  // LocalStorage keys
  STORAGE_KEYS: {
    TRACK: 'drv_track',
    SKILLS: 'drv_skills',
    LAST_RESULTS: 'drv_last_results',
    SORT_PREFERENCE: 'drv_sort_preference',
    DASHBOARD_TOGGLE: 'drv_dashboard_toggle',
    API_KEYS: 'drv_api_keys',
    GITHUB_TOKEN: 'drv_github_token',
    SO_KEY: 'drv_so_key'
  }
};

export default CONSTANTS;
