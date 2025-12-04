import type { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'

/**
 * Middleware pour logger les requêtes entrantes
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
	const start = Date.now()

	// Logger à la fin de la réponse
	res.on('finish', () => {
		const duration = Date.now() - start
		const logData = {
			method: req.method,
			path: req.originalUrl,
			params: req.params,
			query: req.query,
			body: req.body,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
		}

		if (res.statusCode >= 500) {
			logger.error('', logData)
		} else if (res.statusCode >= 400) {
			logger.warn('', logData)
		} else {
			logger.info('', logData)
		}
	})

	next()
}
