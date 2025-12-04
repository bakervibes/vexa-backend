import rateLimit from 'express-rate-limit'
import { config } from '../config/env'
import { TooManyRequestsError } from '../utils/ApiError'

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
		next(new TooManyRequestsError('Limite de requêtes dépassée'))
	},
})

/**
 * Rate limiter strict pour les routes sensibles (login, register, etc.)
 */
export const strictLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.maxRequests,
	message:
		'Trop de tentatives, veuillez réessayer dans ' +
		config.rateLimit.windowMs / 60000 +
		' minutes' +
		' (' +
		config.rateLimit.maxRequests +
		' requêtes max)',
	standardHeaders: true,
	legacyHeaders: false,
	handler: (_req, _res, next) => {
		next(
			new TooManyRequestsError(
				'Trop de tentatives, veuillez réessayer dans ' +
					config.rateLimit.windowMs / 60000 +
					' minutes' +
					' (' +
					config.rateLimit.maxRequests +
					' requêtes max)'
			)
		)
	},
})

/**
 * Rate limiter pour les API externes ou actions coûteuses
 */
export const apiLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.maxRequests,
	message: "Limite d'API atteinte",
	standardHeaders: true,
	legacyHeaders: false,
	handler: (_req, _res, next) => {
		next(new TooManyRequestsError("Limite d'API dépassée, veuillez ralentir"))
	},
})
