# Developer Roadmap Validator

## Executive Summary

Developer Roadmap Validator is a full-stack web application that helps beginner and early-career developers understand where they stand against curated software development roadmaps. Users select a development track and list their known skills. The system then identifies missing core skills and ranks them by real-world importance and market demand.

The project exists to reduce guesswork in learning. Instead of relying on opinions, it uses live public data from GitHub and Stack Overflow to highlight what skills matter most right now. The goal is not to judge skill level, but to give learners a clear, evidence-based learning direction.

---

## Architecture Overview

### High-Level Flow

```
Browser (UI)
  |
  |-- Select track + skills
  |-- View charts and results
  |
Express Server (Node.js)
  |
  |-- Routes
  |-- Controllers
  |-- Validation Service
  |
External APIs
  |-- GitHub API
  |-- Stack Overflow API
```

### Main Components

* Client UI

  * EJS templates
  * Bootstrap 5 styling
  * Canvas charts
  * LocalStorage for persistence

* Server

  * Express app
  * Validation logic
  * API integrations
  * Rate limiting and caching

* Services

  * GitHub demand analysis
  * Stack Overflow demand analysis
  * Cache with TTL
  * PDF report generation

---

## Setup Guide

### Prerequisites

* Node.js 18 or newer
* npm or yarn
* GitHub account for optional API token
* Stack Overflow account for optional API key

### Installation

```bash
git clone <repository-url>
cd developer-roadmap-validator
npm install
```

### Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
GITHUB_TOKEN=
STACKOVERFLOW_KEY=
CACHE_TTL_HOURS=12
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Run the App

```bash
npm start
```

Development mode with reload:

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## Usage Guide

### Basic Usage

1. Open the homepage
2. Choose a track

   * Frontend
   * Backend
   * Full Stack
3. Select skills you already know
4. Click Validate
5. Review results

### Output You Get

* Ranked skill gaps
* Demand level per skill
* Suggested learning order
* Interactive charts
* Exportable PDF report

### Health Check Endpoint

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-02-03T12:00:00Z"
}
```

---

## Configuration

### Environment Variables

| Variable                | Purpose                     |
| ----------------------- | --------------------------- |
| PORT                    | Server port                 |
| GITHUB_TOKEN            | Higher GitHub rate limit    |
| STACKOVERFLOW_KEY       | Higher Stack Overflow quota |
| CACHE_TTL_HOURS         | Cache duration              |
| RATE_LIMIT_MAX_REQUESTS | Requests per window         |
| RATE_LIMIT_WINDOW_MS    | Rate limit window           |

### Secrets Handling

* Tokens are read from environment variables
* Optional user-provided keys are stored only in LocalStorage
* No secrets are written to the database

---

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

* Validation logic
* Cache behaviour
* API service mocking
* Rate limiting
* PDF generation

### Test Strategy

* Unit tests for services
* Integration tests for routes
* Mocked external APIs

---

## Deployment

### Local

* Use `.env`
* Run `npm start`

### Render Deployment

* Build command

  ```
  npm install
  ```
* Start command

  ```
  npm start
  ```

### Production Environment Variables

```
NODE_ENV=production
PORT=10000
CACHE_TTL_HOURS=24
```

### CI/CD Notes

* Tests should pass before deploy
* Environment variables configured via host dashboard
* No database migrations required

---

## Contributing Guide

### Workflow

1. Fork the repository
2. Create a feature branch
3. Make focused changes
4. Add or update tests
5. Open a pull request

### Guidelines

* Keep commits small
* Use clear commit messages
* Follow existing folder structure
* Run tests before PR

---

## FAQ & Troubleshooting

### Nothing happens when I click Validate

* Check browser console
* Confirm server is running
* Verify API rate limits

### API rate limit errors

* Add GitHub token
* Add Stack Overflow key
* Increase cache TTL

### Charts not rendering

* Ensure browser supports Canvas
* Disable ad blockers
* Check JavaScript console

### Data looks inaccurate

* Demand values are estimates
* Public GitHub data includes non-learning repos
* Stack Overflow includes duplicate questions

---

## License and Credits

### License

MIT License. See LICENSE file.

### Credits

* roadmap.sh for roadmap inspiration
* GitHub REST API
* Stack Exchange API
* Open-source contributors
