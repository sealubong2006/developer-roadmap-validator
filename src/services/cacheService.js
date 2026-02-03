/**
 * In-memory cache service with TTL support
 * LRU eviction when max size is reached
 */

import { CONSTANTS } from '../config/constants.js';

class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxSize = process.env.CACHE_MAX_SIZE 
      ? parseInt(process.env.CACHE_MAX_SIZE) 
      : CONSTANTS.CACHE.MAX_SIZE;
    this.defaultTTL = process.env.CACHE_TTL_HOURS 
      ? parseInt(process.env.CACHE_TTL_HOURS) * 3600000 
      : CONSTANTS.CACHE.DEFAULT_TTL_HOURS * 3600000;
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Set cache entry with TTL
   */
  set(key, value, ttlMs = null) {
    const expiry = Date.now() + (ttlMs || this.defaultTTL);
    
    // LRU eviction if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now()
    });

    return value;
  }

  /**
   * Get cache entry if not expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxSize,
      utilizationPercent: ((this.cache.size / this.maxSize) * 100).toFixed(1)
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired() {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get or set pattern (common pattern)
   */
  async getOrSet(key, fetchFunction, ttlMs = null) {
    const cached = this.get(key);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    const freshData = await fetchFunction();
    this.set(key, freshData, ttlMs);
    return { data: freshData, fromCache: false };
  }
}

// Singleton instance
const cacheService = new CacheService();

// Clean expired entries every hour
setInterval(() => {
  const removed = cacheService.cleanExpired();
  if (removed > 0) {
    console.log(`[Cache] Cleaned ${removed} expired entries`);
  }
}, 3600000);

export default cacheService;
