/**
 * Global error handling middleware
 */

export function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: err.message,
      retryAfter: err.retryAfter || null
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      details: err.details || null
    });
  }

  // API errors
  if (err.name === 'APIError') {
    return res.status(err.statusCode || 500).json({
      error: 'API error',
      message: err.message,
      service: err.service || null
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`
  });
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
