# Developer Roadmap Validator

A production-grade full-stack learning tool that validates beginner developers' skills against curated track-specific roadmaps with live evidence from public data sources.

## Features

- **Track-Based Validation**: Choose from Frontend, Backend, or Full Stack development tracks
- **Skill Gap Analysis**: Identify missing core skills with impact-based ranking
- **Live Evidence**: Real demand metrics from GitHub and Stack Overflow APIs
- **Multiple Sorting Options**: Sort gaps by impact, demand, learning order, or quick wins
- **Learning Paths**: Prerequisite-based suggested learning sequences
- **Interactive Charts**: Canvas-based visualizations with accessibility support
- **PDF Export**: Comprehensive reports with charts, methodology, and evidence
- **Persistent State**: LocalStorage for user preferences and results
- **Rate Limiting**: Protection against API abuse with configurable limits
- **Server-Side Caching**: Reduces API calls with TTL-based cache (6-24 hours)

## Architecture

### Tech Stack
- **Backend**: Node.js with Express
- **Templating**: EJS for server-rendered pages
- **UI**: Bootstrap 5 + Custom CSS
- **Charts**: HTML5 Canvas with interactive tooltips
- **PDF**: PDFKit for server-side generation
- **APIs**: GitHub API, Stack Exchange API
- **Storage**: LocalStorage (client-side only)

##DEMO
https://github.com/user-attachments/assets/080ab99f-aafa-43e7-81d7-cd8fc2ca3be6

### Project Structure
```
developer-roadmap-validator/
├── src/
│   ├── server.js                 # Main application entry
│   ├── config/
│   │   ├── constants.js          # Application constants
│   │   ├── roadmaps.js           # Curated skill lists and weights
│   │   └── prerequisites.js      # Learning order chains
│   ├── controllers/
│   │   ├── pageController.js     # Page rendering
│   │   └── apiController.js      # API endpoints
│   ├── services/
│   │   ├── cacheService.js       # In-memory cache with TTL
│   │   ├── githubService.js      # GitHub API integration
│   │   ├── stackoverflowService.js # SO API integration
│   │   ├── validationService.js  # Core validation logic
│   │   ├── chartService.js       # Chart image generation
│   │   └── pdfService.js         # PDF generation
│   ├── middleware/
│   │   ├── rateLimiter.js        # Rate limiting logic
│   │   └── errorHandler.js       # Global error handling
│   └── routes/
│       ├── index.js              # Route definitions
│       └── api.js                # API route definitions
├── views/
│   ├── layout.ejs                # Base layout
│   ├── index.ejs                 # Home page
│   ├── results.ejs               # Results page
│   └── partials/
│       ├── header.ejs
│       ├── footer.ejs
│       └── charts.ejs
├── public/
│   ├── css/
│   │   └── styles.css            # Custom styles
│   └── js/
│       ├── app.js                # Main client logic
│       ├── storage.js            # LocalStorage management
│       ├── charts.js             # Canvas chart rendering
│       └── skills.js             # Skill selection UI
├── tests/
│   ├── validation.test.js
│   ├── cache.test.js
│   └── api.test.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd developer-roadmap-validator
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `PORT`: Server port (default: 3000)
- `GITHUB_TOKEN`: Optional GitHub Personal Access Token
- `STACKOVERFLOW_KEY`: Optional Stack Exchange API key
- `CACHE_TTL_HOURS`: Cache duration (default: 12)
- Rate limiting settings

4. Start the server:
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

5. Access the application:
```
http://localhost:3000
```

## API Key Handling

### GitHub API
- **Without token**: 60 requests/hour per IP
- **With token**: 5,000 requests/hour
- **How to get**: https://github.com/settings/tokens
- **Required scopes**: None (public data only)

Users can provide their GitHub token via:
1. Environment variable: `GITHUB_TOKEN`
2. UI settings (saved in LocalStorage)

### Stack Overflow API
- **Without key**: 300 requests/day per IP
- **With key**: 10,000 requests/day
- **How to get**: https://stackapps.com/apps/oauth/register
- **Required**: Just register an application

Users can provide their SO key via:
1. Environment variable: `STACKOVERFLOW_KEY`
2. UI settings (saved in LocalStorage)

## Rate Limiting Behavior

### IP-Based Limits
- Default: 100 requests per 15 minutes per IP
- Configurable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`
- Returns 429 status when exceeded

### API Key Limits
- Separate limit per user-provided API key
- Default: 50 requests per 15 minutes per key
- Prevents abuse of shared keys

### Cache Behavior
- Cached responses don't count toward rate limits
- Default TTL: 12 hours (configurable)
- Cache key includes: skill, track, time window
- Cache size limit: 100 entries (LRU eviction)

### Error Handling
- **Rate Limited**: Shows friendly message with retry time
- **API Errors**: Graceful degradation with partial data
- **Network Issues**: Retry with exponential backoff
- **Invalid Input**: Client-side and server-side validation

## Curated Skill Lists

### Versioning
- Current version: **v1.0** (Last updated: February 2026)
- Based on: roadmap.sh community roadmaps
- Reference: https://roadmap.sh

### Track Definitions

**Frontend**: HTML, CSS, JavaScript, React, responsive design, browser APIs, etc.

**Backend**: Node.js, databases, APIs, authentication, server concepts, etc.

**Full Stack**: Separate curated list combining critical frontend and backend skills

### Skill Weights
Each skill has an impact weight (1-10):
- **Critical (8-10)**: Core fundamentals, blocking for most work
- **Important (5-7)**: Significant productivity impact
- **Useful (1-4)**: Nice to have, situational

## Features in Detail

### Skill Selection
- Searchable dropdown with autocomplete
- Multiple skills per session
- Proficiency levels: Beginner, Intermediate, Strong
- Persistent across track switches

### Validation Results
- **Gap Analysis**: Missing core skills ranked by impact
- **Keep Sharp**: Strong proficiency skills shown separately
- **Evidence**: Live GitHub repo counts and SO question volumes
- **Demand Metrics**: 6-month window with monthly buckets
- **Demand Categories**: Low/Medium/High based on thresholds

### Sorting Options
1. **Impact** (default): By skill weight
2. **Demand**: By combined GitHub + SO score
3. **Learning Order**: By prerequisite chains
4. **Quick Wins**: Low effort, high value skills

### Learning Paths
- Prerequisite chains per track
- Suggested "Next 3" topics
- Separate view from gap ranking
- Considers already-learned skills

### Charts
All charts include:
- Interactive tooltips (hover)
- Click-to-pin functionality
- Accessible data table toggle
- Keyboard navigation
- ARIA labels

**Chart Types**:
under development contribution is welcomed

### PDF Export
Server-generated PDF includes:
- Executive summary
- Methodology and data sources
- Roadmap reference and version
- Timestamps and cache info
- Ranked gap list with evidence
- Chart images (embedded from Canvas)
- Learning order checklist
- Keep sharp section
- Demand evidence tables

## Deployment

### Render.com

1. Create a new Web Service
2. Connect your repository
3. Configure build settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables in dashboard
5. Deploy

### Environment Variables for Production
```
NODE_ENV=production
PORT=10000
GITHUB_TOKEN=your_token_here
STACKOVERFLOW_KEY=your_key_here
CACHE_TTL_HOURS=24
```

### Health Check
Endpoint: `GET /health`
Returns: `{ "status": "ok", "timestamp": "..." }`

## Limitations

### API Rate Limits
- **GitHub**: Aggressive rate limiting without token
- **Stack Overflow**: Daily limits apply
- **Solution**: Encourage users to provide their own keys

### Data Accuracy
- Demand metrics are estimates based on public signals
- GitHub repo counts include non-learning projects
- Stack Overflow questions may include duplicates
- Results are indicative, not definitive

### Scope
- No user accounts or databases
- No persistent server-side user data
- LocalStorage cleared on browser data wipe
- No offline functionality

### Browser Support
- Modern browsers only (ES6+ required)
- Canvas support required for charts
- LocalStorage required for persistence

## Testing

Run tests:
```bash
npm test
```

Test coverage:
- Validation logic
- Cache service
- API integrations (with mocks)
- Rate limiting
- Chart generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: <repository-url>/issues
- Documentation: This README
- API Docs: See code comments

## Acknowledgments

- Skill lists inspired by roadmap.sh
- GitHub API: https://docs.github.com/rest
- Stack Exchange API: https://api.stackexchange.com/docs
