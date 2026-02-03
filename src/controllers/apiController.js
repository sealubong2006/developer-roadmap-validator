/**
 * API controller
 * Handles API endpoints for validation and data fetching
 */

import validationService from '../services/validationService.js';
import pdfService from '../services/pdfService.js';
import githubService from '../services/githubService.js';
import stackoverflowService from '../services/stackoverflowService.js';
import cacheService from '../services/cacheService.js';
import { getAllSkills, getCoreSkills } from '../config/roadmaps.js';
import { CONSTANTS } from '../config/constants.js';

class ApiController {
  /**
   * Validate user skills against track
   */
  async validateSkills(req, res) {
    try {
      const { track, skills, githubToken, soKey, sortBy } = req.body;

      // Validation
      if (!track || !Object.values(CONSTANTS.TRACKS).includes(track)) {
        return res.status(400).json({
          error: 'Invalid track',
          message: 'Track must be one of: frontend, backend, fullstack'
        });
      }

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          error: 'Invalid skills',
          message: 'Skills must be a non-empty array'
        });
      }

      // Validate skill objects
      for (const skill of skills) {
        if (!skill.name || !skill.proficiency) {
          return res.status(400).json({
            error: 'Invalid skill format',
            message: 'Each skill must have name and proficiency'
          });
        }

        if (!Object.values(CONSTANTS.PROFICIENCY_LEVELS).includes(skill.proficiency)) {
          return res.status(400).json({
            error: 'Invalid proficiency level',
            message: 'Proficiency must be: beginner, intermediate, or strong'
          });
        }
      }

      // Perform validation
      let results;
      if (track === CONSTANTS.TRACKS.FULLSTACK) {
        results = await validationService.validateFullstack(skills, {
          githubToken,
          soKey,
          sortBy: sortBy || CONSTANTS.SORT_OPTIONS.IMPACT
        });
      } else {
        results = await validationService.validateSkills(track, skills, {
          githubToken,
          soKey,
          sortBy: sortBy || CONSTANTS.SORT_OPTIONS.IMPACT
        });
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('[API] Validation error:', error);
      res.status(500).json({
        error: 'Validation failed',
        message: error.message
      });
    }
  }

  /**
   * Get skill trends
   */
  async getSkillTrends(req, res) {
    try {
      const { skill, track, githubToken, soKey } = req.query;

      if (!skill || !track) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'skill and track are required'
        });
      }

      if (!Object.values(CONSTANTS.TRACKS).includes(track)) {
        return res.status(400).json({
          error: 'Invalid track',
          message: 'Track must be one of: frontend, backend, fullstack'
        });
      }

      const trends = await validationService.getSkillTrends(
        skill,
        track,
        githubToken,
        soKey
      );

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('[API] Trends error:', error);
      res.status(500).json({
        error: 'Failed to fetch trends',
        message: error.message
      });
    }
  }

  /**
   * Generate PDF report
   */
  async generatePDF(req, res) {
    try {
      const { validationResults, userSkills, track } = req.body;

      if (!validationResults || !track) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'validationResults and track are required'
        });
      }

      const pdfBuffer = await pdfService.generateValidationReport(validationResults, {
        userSkills,
        track
      });

      const filename = `roadmap-validation-${track}-${Date.now()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('[API] PDF generation error:', error);
      res.status(500).json({
        error: 'PDF generation failed',
        message: error.message
      });
    }
  }

  /**
   * Get all available skills
   */
  getSkills(req, res) {
    try {
      const skills = getAllSkills();
      res.json({
        success: true,
        data: skills
      });
    } catch (error) {
      console.error('[API] Get skills error:', error);
      res.status(500).json({
        error: 'Failed to fetch skills',
        message: error.message
      });
    }
  }

  /**
   * Get core skills for a track
   */
  getCoreSkills(req, res) {
    try {
      const { track } = req.params;

      if (!Object.values(CONSTANTS.TRACKS).includes(track)) {
        return res.status(400).json({
          error: 'Invalid track',
          message: 'Track must be one of: frontend, backend, fullstack'
        });
      }

      const coreSkills = getCoreSkills(track);
      res.json({
        success: true,
        data: coreSkills
      });
    } catch (error) {
      console.error('[API] Get core skills error:', error);
      res.status(500).json({
        error: 'Failed to fetch core skills',
        message: error.message
      });
    }
  }

  /**
   * Get API rate limit status
   */
  async getRateLimitStatus(req, res) {
    try {
      const { githubToken, soKey } = req.query;

      const [githubStatus, soStatus] = await Promise.all([
        githubService.getRateLimitStatus(githubToken),
        stackoverflowService.getQuotaStatus(soKey)
      ]);

      res.json({
        success: true,
        data: {
          github: githubStatus,
          stackoverflow: soStatus
        }
      });
    } catch (error) {
      console.error('[API] Rate limit status error:', error);
      res.status(500).json({
        error: 'Failed to fetch rate limit status',
        message: error.message
      });
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(req, res) {
    try {
      const stats = cacheService.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('[API] Cache stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch cache stats',
        message: error.message
      });
    }
  }

  /**
   * Clear cache (admin endpoint - should be protected in production)
   */
  clearCache(req, res) {
    try {
      cacheService.clear();
      res.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    } catch (error) {
      console.error('[API] Clear cache error:', error);
      res.status(500).json({
        error: 'Failed to clear cache',
        message: error.message
      });
    }
  }

  /**
   * Health check
   */
  healthCheck(req, res) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      memory: process.memoryUsage()
    });
  }
}

export default new ApiController();
