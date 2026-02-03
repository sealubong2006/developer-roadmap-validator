/**
 * Stack Exchange API service for Stack Overflow data
 */

import axios from 'axios';
import cacheService from './cacheService.js';
import { CONSTANTS } from '../config/constants.js';

class StackOverflowService {
  constructor() {
    this.baseURL = CONSTANTS.API.STACKOVERFLOW_BASE_URL;
    this.key = process.env.STACKOVERFLOW_KEY || null;
  }

  /**
   * Build query parameters
   */
  getQueryParams(customKey = null) {
    const params = {
      site: 'stackoverflow'
    };

    const key = customKey || this.key;
    if (key) {
      params.key = key;
    }

    return params;
  }

  /**
   * Search questions by tag
   */
  async searchQuestions(tags, options = {}) {
    const {
      customKey = null,
      fromDate = null,
      toDate = null,
      sort = 'activity',
      order = 'desc',
      pageSize = 100
    } = options;

    const cacheKey = cacheService.generateKey('stackoverflow:search', {
      tags: tags.join(','),
      fromDate: fromDate || 'all',
      toDate: toDate || 'all',
      sort,
      pageSize
    });

    try {
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const params = {
            ...this.getQueryParams(customKey),
            tagged: tags.join(';'),
            sort,
            order,
            pagesize: pageSize
          };

          if (fromDate) params.fromdate = fromDate;
          if (toDate) params.todate = toDate;

          const response = await axios.get(`${this.baseURL}/questions`, {
            params,
            timeout: 10000,
            headers: {
              'Accept-Encoding': 'gzip'
            }
          });

          return {
            total: response.data.total,
            items: response.data.items,
            hasMore: response.data.has_more,
            quotaRemaining: response.data.quota_remaining,
            timestamp: new Date().toISOString()
          };
        }
      );

      return result;
    } catch (error) {
      console.error('[StackOverflow] Search error:', error.message);
      
      if (error.response?.status === 429) {
        throw new Error('Stack Overflow API rate limit exceeded.');
      }

      if (error.response?.status === 400 && error.response?.data?.error_message) {
        throw new Error(`Stack Overflow API error: ${error.response.data.error_message}`);
      }

      throw new Error(`Stack Overflow API error: ${error.message}`);
    }
  }

  /**
   * Get question count for a skill over time
   */
  async getSkillDemandOverTime(skillName, track, customKey = null) {
    const cacheKey = cacheService.generateKey('stackoverflow:demand-trend', {
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
          const tags = this.buildSkillTags(skillName, track);

          for (let i = 0; i < CONSTANTS.DEMAND_WINDOW_MONTHS; i++) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            // Calculate Unix timestamps
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            
            const fromDate = Math.floor(startDate.getTime() / 1000);
            const toDate = Math.floor(endDate.getTime() / 1000);

            try {
              const searchResult = await this.searchQuestions(tags, {
                customKey,
                fromDate,
                toDate,
                pageSize: 1 // We only need the count
              });

              monthlyData.unshift({
                month: `${year}-${String(month).padStart(2, '0')}`,
                count: searchResult.data.total,
                label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
              });

              // Small delay to respect rate limits
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`[StackOverflow] Error fetching data for ${year}-${month}:`, error.message);
              monthlyData.unshift({
                month: `${year}-${String(month).padStart(2, '0')}`,
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
      console.error('[StackOverflow] Demand trend error:', error.message);
      throw error;
    }
  }

  /**
   * Build tags for a skill
   */
  buildSkillTags(skillName, track) {
    // Normalize skill name to tags
    const baseTag = skillName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\//g, '-')
      .replace(/\./g, '')
      .replace(/\+/g, 'plus');

    const tags = [baseTag];

    // Add common variations
    const tagMap = {
      'javascript': ['javascript', 'js'],
      'typescript': ['typescript', 'ts'],
      'nodejs': ['node.js', 'nodejs'],
      'node.js': ['node.js', 'nodejs'],
      'reactjs': ['reactjs', 'react'],
      'react': ['reactjs', 'react'],
      'expressjs': ['express', 'expressjs'],
      'express.js': ['express', 'expressjs'],
      'mongodb': ['mongodb', 'mongo'],
      'postgresql': ['postgresql', 'postgres'],
      'css3': ['css', 'css3'],
      'html5': ['html', 'html5'],
      'es6': ['ecmascript-6', 'es6'],
      'async-await': ['async-await', 'javascript'],
      'jwt': ['jwt', 'json-web-token'],
      'oauth': ['oauth', 'oauth-2.0']
    };

    if (tagMap[baseTag]) {
      return tagMap[baseTag];
    }

    return tags;
  }

  /**
   * Get current demand for a skill
   */
  async getSkillDemand(skillName, track, customKey = null) {
    const cacheKey = cacheService.generateKey('stackoverflow:demand', {
      skill: skillName,
      track
    });

    try {
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const tags = this.buildSkillTags(skillName, track);
          
          // Get questions from last 6 months for relevance
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          const fromDate = Math.floor(sixMonthsAgo.getTime() / 1000);

          const searchResult = await this.searchQuestions(tags, {
            customKey,
            fromDate,
            pageSize: 1
          });

          return {
            skill: skillName,
            track,
            count: searchResult.data.total,
            tags: tags,
            timestamp: new Date().toISOString()
          };
        }
      );

      return result;
    } catch (error) {
      console.error('[StackOverflow] Demand error:', error.message);
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
   * Get quota information
   */
  async getQuotaStatus(customKey = null) {
    try {
      const params = this.getQueryParams(customKey);
      
      const response = await axios.get(`${this.baseURL}/info`, {
        params,
        timeout: 5000
      });

      return {
        quotaRemaining: response.data.quota_remaining,
        quotaMax: response.data.quota_max,
        authenticated: !!customKey || !!this.key
      };
    } catch (error) {
      console.error('[StackOverflow] Quota check error:', error.message);
      return null;
    }
  }
}

export default new StackOverflowService();
