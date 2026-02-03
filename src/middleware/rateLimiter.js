/**
 * Rate limiting middleware
 * Separate limits for IP and API keys
 */

import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants.js';

// Store for tracking per-key requests
const keyRequestStore = new Map();

/**
 * Clean expired entries from key store
 */
function cleanExpiredKeyEntries() {
  const now = Date.now();
  for (const [key, data] of keyRequestStore.entries()) {
    if (now > data.resetTime) {
      keyRequestStore.delete(key);
    }
  }
}

// Clean every hour
setInterval(cleanExpiredKeyEntries, 3600000);

/**
 * IP-based rate limiter
 */
export const ipRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: null
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: retryAfter,
      limit: req.rateLimit.limit,
      current: req.rateLimit.current
    });
  }
});

/**
 * API key-based rate limiter middleware
 */
export function apiKeyRateLimiter(req, res, next) {
  const githubToken = req.body.githubToken || req.query.githubToken;
  const soKey = req.body.soKey || req.query.soKey;
  
  const apiKey = githubToken || soKey;
  
  // If no API key, skip this limiter (IP limiter will handle)
  if (!apiKey) {
    return next();
  }

  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || CONSTANTS.RATE_LIMIT.WINDOW_MS;
  const maxPerKey = parseInt(process.env.RATE_LIMIT_PER_KEY_MAX) || CONSTANTS.RATE_LIMIT.MAX_PER_KEY;

  // Get or create tracking data for this key
  let keyData = keyRequestStore.get(apiKey);
  
  if (!keyData || now > keyData.resetTime) {
    // Create new window
    keyData = {
      count: 0,
      resetTime: now + windowMs
    };
    keyRequestStore.set(apiKey, keyData);
  }

  // Increment count
  keyData.count++;

  // Check limit
  if (keyData.count > maxPerKey) {
    const retryAfter = Math.ceil((keyData.resetTime - now) / 1000);
    return res.status(429).json({
      error: 'Rate limit exceeded for this API key. Please try again later.',
      retryAfter: retryAfter,
      limit: maxPerKey,
      current: keyData.count
    });
  }

  // Add rate limit info to response headers
  res.set({
    'X-RateLimit-Limit-Key': maxPerKey,
    'X-RateLimit-Remaining-Key': maxPerKey - keyData.count,
    'X-RateLimit-Reset-Key': new Date(keyData.resetTime).toISOString()
  });

  next();
}

/**
 * Combined rate limiter (IP + API key)
 */
export function combinedRateLimiter(req, res, next) {
  ipRateLimiter(req, res, (err) => {
    if (err) return next(err);
    apiKeyRateLimiter(req, res, next);
  });
}

export default {
  ipRateLimiter,
  apiKeyRateLimiter,
  combinedRateLimiter
};
