/**
 * API routes
 * Handles all API endpoints
 */

import express from 'express';
import apiController from '../controllers/apiController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { combinedRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to all API routes
router.use(combinedRateLimiter);

// Health check (no auth required)
router.get('/health', apiController.healthCheck.bind(apiController));

// Validation endpoints
router.post('/validate', asyncHandler(apiController.validateSkills.bind(apiController)));

// Skills endpoints
router.get('/skills', apiController.getSkills.bind(apiController));
router.get('/skills/core/:track', apiController.getCoreSkills.bind(apiController));

// Trends endpoint
router.get('/trends', asyncHandler(apiController.getSkillTrends.bind(apiController)));

// PDF generation
router.post('/generate-pdf', asyncHandler(apiController.generatePDF.bind(apiController)));

// Rate limit status
router.get('/rate-limit-status', asyncHandler(apiController.getRateLimitStatus.bind(apiController)));

// Cache management
router.get('/cache/stats', apiController.getCacheStats.bind(apiController));
router.post('/cache/clear', apiController.clearCache.bind(apiController));

export default router;
