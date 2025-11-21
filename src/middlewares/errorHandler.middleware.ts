import { env } from '@/config'
import { ApiError } from '@/utils/ApiError'
import { sendError } from '@/utils/response'
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import type { NextFunction, Request, Response } from 'express'

/**
 * Middleware de gestion globale des erreurs
 * Doit être le dernier middleware ajouté à Express
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
	// Log l'erreur en développement
	if (env.NODE_ENV === 'development') {
		console.error('Error:', err)
	}

	// Erreur API personnalisée
	if (err instanceof ApiError) {
		return sendError(res, err.message, err.statusCode, getErrorCode(err.statusCode), err.details)
	}

	// Erreurs Prisma
	if (err.name === 'PrismaClientKnownRequestError') {
		const prismaError = err as PrismaClientKnownRequestError

		switch (prismaError.code) {
			case 'P2002':
				return sendError(res, 'Cette ressource existe déjà', 409, 'CONFLICT', {
					field: prismaError.meta?.target,
				})
			case 'P2025':
				return sendError(res, 'Ressource non trouvée', 404, 'NOT_FOUND')
			default:
				return sendError(res, 'Erreur de base de données', 500, 'DATABASE_ERROR')
		}
	}

	// Erreur de validation JSON
	if (err instanceof SyntaxError && 'body' in err) {
		return sendError(res, 'JSON invalide', 400, 'INVALID_JSON')
	}

	// Erreur inconnue (ne pas exposer les détails en production)
	const message =
		env.NODE_ENV === 'development' ? err.message : 'Une erreur inattendue est survenue'

	return sendError(res, message, 500, 'INTERNAL_ERROR')
}

/**
 * Middleware pour les routes non trouvées
 */
export const notFoundHandler = (req: Request, res: Response) => {
	sendError(res, `Route ${req.method} ${req.path} non trouvée`, 404, 'ROUTE_NOT_FOUND')
}

/**
 * Convertit un status code en code d'erreur
 */
function getErrorCode(statusCode: number): string {
	const codes: Record<number, string> = {
		400: 'BAD_REQUEST',
		401: 'UNAUTHORIZED',
		403: 'FORBIDDEN',
		404: 'NOT_FOUND',
		409: 'CONFLICT',
		422: 'VALIDATION_ERROR',
		429: 'TOO_MANY_REQUESTS',
		500: 'INTERNAL_ERROR',
		503: 'SERVICE_UNAVAILABLE',
	}

	return codes[statusCode] || 'UNKNOWN_ERROR'
}
