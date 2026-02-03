# Developer Roadmap Validator - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn
- (Optional) GitHub Personal Access Token
- (Optional) Stack Overflow API key

### 2. Installation

```bash
# Navigate to project directory
cd developer-roadmap-validator

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# (Optional) Edit .env with your API keys
nano .env
```

### 3. Run Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Visit: http://localhost:3000

## 📁 Project Structure

```
developer-roadmap-validator/
├── src/
│   ├── config/           # Configuration files
│   │   ├── constants.js      # App constants
│   │   ├── roadmaps.js       # Curated skill lists (v1.0)
│   │   └── prerequisites.js  # Learning order chains
│   ├── services/         # Business logic
│   │   ├── cacheService.js       # TTL-based cache
│   │   ├── githubService.js      # GitHub API
│   │   ├── stackoverflowService.js  # SO API
│   │   ├── validationService.js  # Core validation
│   │   ├── chartService.js       # Canvas charts
│   │   └── pdfService.js         # PDF generation
│   ├── controllers/      # Request handlers
│   │   ├── pageController.js  # View rendering
│   │   └── apiController.js   # API endpoints
│   ├── middleware/       # Express middleware
│   │   ├── rateLimiter.js    # Rate limiting
│   │   └── errorHandler.js   # Error handling
│   ├── routes/           # Route definitions
│   │   ├── index.js      # Page routes
│   │   └── api.js        # API routes
│   └── server.js         # Main entry point
├── views/                # EJS templates
│   ├── layout.ejs
│   ├── index.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
├── public/               # Static assets
│   ├── css/
│   │   └── styles.css    # Custom styles
│   └── js/
│       ├── app.js        # Main client logic
│       ├── storage.js    # LocalStorage
│       ├── charts.js     # Canvas rendering
│       └── skills.js     # Skill management
├── tests/                # Test files
│   └── basic.test.js
├── package.json
├── .env.example
└── README.md
```

## 🎯 Key Features

### 1. Track Selection
- **Frontend**: HTML, CSS, JavaScript, React, etc.
- **Backend**: Node.js, databases, APIs, security, etc.
- **Full Stack**: Separate curated list with frontend/backend sections

### 2. Skill Validation
- Add skills with proficiency levels (Beginner/Intermediate/Strong)
- Autocomplete from 100+ curated skills
- Persistent across track switches (LocalStorage)

### 3. Gap Analysis
- Missing core skills identified
- Ranked by: Impact, Demand, Learning Order, or Quick Wins
- Live evidence from GitHub & Stack Overflow APIs

### 4. Learning Paths
- Prerequisite-based ordering
- "Next 3" suggestions
- Complete learning roadmap

### 5. Charts & Visualization
- Canvas-based interactive charts
- Accessible data tables (toggle view)
- Keyboard navigation & ARIA labels

### 6. PDF Export
- Server-generated comprehensive report
- Embedded chart images
- Methodology, evidence tables, timestamps

## 🔑 API Keys (Optional but Recommended)

### GitHub Personal Access Token
**Why?** Increases rate limit from 60 to 5,000 requests/hour

**How to get:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. No scopes needed (public data only)
4. Copy token to .env or UI settings

### Stack Overflow API Key
**Why?** Increases rate limit from 300 to 10,000 requests/day

**How to get:**
1. Go to https://stackapps.com/apps/oauth/register
2. Register a new application
3. Copy the key to .env or UI settings

**Note:** Users can provide keys via UI (Settings modal) - saved in LocalStorage

## 🚢 Deployment to Render.com

### 1. Prepare Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Create Render Service
1. Go to https://render.com
2. New → Web Service
3. Connect your repository
4. Configure:
   - **Name:** developer-roadmap-validator
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter for better performance)

### 3. Environment Variables
Add in Render dashboard:
```
NODE_ENV=production
PORT=10000
GITHUB_TOKEN=<your_token>
STACKOVERFLOW_KEY=<your_key>
CACHE_TTL_HOURS=24
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Deploy
- Render will auto-deploy on push to main branch
- Health check endpoint: `/api/health`

## 📊 How It Works

### Validation Flow
1. User selects track and adds skills
2. Click "Validate" → API call to `/api/validate`
3. Server:
   - Identifies missing core skills (gaps)
   - Fetches GitHub repo counts
   - Fetches Stack Overflow question counts
   - Calculates combined demand score
   - Categorizes as Low/Medium/High
   - Sorts by selected criteria
   - Generates learning order
4. Results displayed with charts
5. Optional: Export to PDF

### Caching Strategy
- **TTL:** 12 hours default (configurable)
- **Size:** 100 entries max (LRU eviction)
- **Keys:** Include skill, track, time window
- **Benefits:** Reduces API calls, faster responses

### Rate Limiting
- **IP-based:** 100 requests per 15 min
- **API key-based:** 50 requests per 15 min per key
- **Response:** 429 status with retry time

## 🎨 Customization

### Update Skill Lists
Edit `src/config/roadmaps.js`:
```javascript
export const ROADMAPS = {
  frontend: {
    coreSkills: [
      { name: 'HTML', weight: 10, category: 'fundamentals' },
      // Add more...
    ]
  }
};
```

**Remember to update:**
- `ROADMAP_VERSION` in constants.js
- `ROADMAP_LAST_UPDATED` date

### Modify Demand Thresholds
Edit `src/config/constants.js`:
```javascript
DEMAND_THRESHOLDS: {
  HIGH: 1000,
  MEDIUM: 300
}
```

### Change UI Colors
Edit `public/css/styles.css`:
```css
:root {
  --primary-color: #2E86AB;
  --secondary-color: #A23B72;
  /* Customize... */
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific file
node --test tests/basic.test.js
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### Canvas Installation Issues (macOS)
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install canvas
```

### Canvas Installation Issues (Ubuntu/Debian)
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas
```

### Rate Limit Errors
- Provide API keys in Settings modal
- Check rate limit status at `/api/rate-limit-status`
- Wait for window reset (shown in error message)

### PDF Generation Fails
- Ensure Canvas is properly installed
- Check server logs for specific errors
- Verify PDFKit dependency is installed

## 📈 Performance Tips

1. **Enable API Keys:** Dramatically increases rate limits
2. **Increase Cache TTL:** Set to 24 hours in production
3. **Use CDN:** For Bootstrap/fonts (already configured)
4. **Enable Compression:** Already enabled in server.js
5. **Upgrade Render Instance:** For higher traffic

## 🔒 Security Notes

- API keys stored in LocalStorage (client-side only)
- No server-side user data persistence
- Helmet.js for security headers
- Rate limiting prevents abuse
- No authentication required (stateless)

## 📝 Maintenance

### Monthly Tasks
- Review and update skill lists in roadmaps.js
- Check for new dependencies (`npm outdated`)
- Review error logs in production
- Monitor cache hit rates

### Quarterly Tasks
- Update roadmap version number
- Review demand thresholds
- Check API documentation for changes
- Security audit (`npm audit`)

## 🤝 Contributing

To add new features:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Update README if needed
6. Submit pull request

## 📄 License

MIT License - Feel free to use and modify

## 🆘 Support

- **Issues:** GitHub Issues
- **API Docs:** Code comments + README
- **Roadmap Source:** https://roadmap.sh

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Node Version:** 18+
