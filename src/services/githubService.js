/**
 * GitHub API service for fetching skill demand data
 */

import axios from 'axios';
import cacheService from './cacheService.js';
import { CONSTANTS } from '../config/constants.js';

class GitHubService {
  constructor() {
    this.baseURL = CONSTANTS.API.GITHUB_BASE_URL;
    this.token = process.env.GITHUB_TOKEN || null;
  }

  /**
   * Get headers for GitHub API
   */
  getHeaders(customToken = null) {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Developer-Roadmap-Validator'
    };

    const token = customToken || this.token;
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    return headers;
  }

  /**
   * Search repositories by topic/keyword
   */
  async searchRepositories(query, options = {}) {
    const {
      customToken = null,
      sort = 'stars',
      order = 'desc',
      perPage = 100
    } = options;

    const cacheKey = cacheService.generateKey('github:search', {
      query,
      sort,
      order,
      perPage
    });

    try {
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const response = await axios.get(`${this.baseURL}/search/repositories`, {
            params: {
              q: query,
              sort,
              order,
              per_page: perPage
            },
            headers: this.getHeaders(customToken),
            timeout: 10000
          });

          return {
            totalCount: response.data.total_count,
            items: response.data.items,
            timestamp: new Date().toISOString()
          };
        }
      );

      return result;
    } catch (error) {
      console.error('[GitHub] Search error:', error.message);
      
      if (error.response?.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please provide an API token.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid GitHub token. Please check your credentials.');
      }

      throw new Error(`GitHub API error: ${error.message}`);
    }
  }

  /**
   * Get repository count for a skill over time
   * Returns monthly data for the past 6 months
   */
  async getSkillDemandOverTime(skillName, track, customToken = null) {
    const cacheKey = cacheService.generateKey('github:demand-trend', {
      skill: skillName,
      track,
      months: CONSTANTS.DEMAND_WINDOW_MONTHS
    });

    try {
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const now = new Date();
          const monthlyData = [];

          // Generate queries for each month
          for (let i = 0; i < CONSTANTS.DEMAND_WINDOW_MONTHS; i++) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const startDate = `${year}-${month}-01`;
            
            // Calculate end date
            const endDate = new Date(year, parseInt(month), 0);
            const endDateStr = `${year}-${month}-${String(endDate.getDate()).padStart(2, '0')}`;

            // Build query
            const query = this.buildSkillQuery(skillName, track, startDate, endDateStr);

            try {
              const searchResult = await this.searchRepositories(query, {
                customToken,
                perPage: 1 // We only need the count
              });

              monthlyData.unshift({
                month: `${year}-${month}`,
                count: searchResult.data.totalCount,
                label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
              });

              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`[GitHub] Error fetching data for ${year}-${month}:`, error.message);
              monthlyData.unshift({
                month: `${year}-${month}`,
                count: 0,
                label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                error: true
              });
            }
          }

          return {
            skill: skillName,
            track,
            monthlyData,
            timestamp: new Date().toISOString()
          };
        }
      );

      return result;
    } catch (error) {
      console.error('[GitHub] Demand trend error:', error.message);
      throw error;
    }
  }

  /**
   * Build search query for a skill
   */
  buildSkillQuery(skillName, track, startDate = null, endDate = null) {
    // Normalize skill name for search
    const searchTerm = skillName.toLowerCase()
      .replace(/[\/\\]/g, '-')  // Replace slashes
      .replace(/\+/g, 'plus')   // ES6+ -> ES6plus
      .replace(/\./g, '');      // Node.js -> nodejs

    let query = `${searchTerm} in:readme,description`;

    // Add track context
    if (track === 'frontend') {
      query += ' frontend OR client-side OR browser';
    } else if (track === 'backend') {
      query += ' backend OR server-side OR api';
    } else if (track === 'fullstack') {
      query += ' fullstack OR full-stack OR web-development';
    }

    // Add date range if provided
    if (startDate && endDate) {
      query += ` created:${startDate}..${endDate}`;
    }

    return query;
  }

  /**
   * Get current demand for a skill (simple count)
   */
  async getSkillDemand(skillName, track, customToken = null) {
    const cacheKey = cacheService.generateKey('github:demand', {
      skill: skillName,
      track
    });

    try {
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const query = this.buildSkillQuery(skillName, track);
          const searchResult = await this.searchRepositories(query, {
            customToken,
            perPage: 1
          });

          return {
            skill: skillName,
            track,
            count: searchResult.data.totalCount,
            timestamp: new Date().toISOString()
          };
        }
      );

      return result;
    } catch (error) {
      console.error('[GitHub] Demand error:', error.message);
      return {
        skill: skillName,
        track,
        count: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(customToken = null) {
    try {
      const response = await axios.get(`${this.baseURL}/rate_limit`, {
        headers: this.getHeaders(customToken),
        timeout: 5000
      });

      return {
        limit: response.data.rate.limit,
        remaining: response.data.rate.remaining,
        reset: new Date(response.data.rate.reset * 1000).toISOString(),
        authenticated: !!customToken || !!this.token
      };
    } catch (error) {
      console.error('[GitHub] Rate limit check error:', error.message);
      return null;
    }
  }
}

export default new GitHubService();
