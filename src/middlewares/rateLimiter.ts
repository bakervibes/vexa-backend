import rateLimit from 'express-rate-limit';
import { config } from '../config/env';
import { TooManyRequestsError } from '../utils/ApiError';

/**
 * Rate limiter général pour toutes les routes
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Limite de requêtes dépassée'));
  }
});

/**
 * Rate limiter strict pour les routes sensibles (login, register, etc.)
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requêtes max
  message: 'Trop de tentatives, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Trop de tentatives, veuillez réessayer dans 15 minutes'));
  }
});

/**
 * Rate limiter pour les API externes ou actions coûteuses
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requêtes par minute
  message: 'Limite d\'API atteinte',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Limite d\'API dépassée, veuillez ralentir'));
  }
});

