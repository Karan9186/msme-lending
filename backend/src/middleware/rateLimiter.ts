import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../config/logger';

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_WINDOW || '900000', 10), // 15 minutes default
  max: parseInt(process.env.API_RATE_LIMIT || '100', 10), // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many requests',
      details: 'Please try again later',
      retryAfter: Math.ceil(parseInt(process.env.API_RATE_WINDOW || '900000', 10) / 1000),
    });
  },
});

// Stricter rate limiter for decision endpoint
export const decisionRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 decisions per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Decision rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many decision requests',
      details: 'Maximum 10 loan applications per minute allowed',
      retryAfter: 60,
    });
  },
});
