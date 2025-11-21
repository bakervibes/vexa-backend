import { Prisma } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import { sendError } from '../utils/response'

/**
 * Convertit les erreurs en ApiError
 */
const convertToApiError = (err: any): ApiError => {
	// Déjà une ApiError
	if (err instanceof ApiError) {
		return err
	}

	// Erreur de validation Zod
	if (err instanceof ZodError) {
		const errors = err.issues.map((e: z.ZodIssue) => ({
			field: e.path.join('.'),
			message: e.message
		}))
		return new ApiError(422, 'Erreur de validation', true, errors)
	}

	// Erreurs Prisma
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		switch (err.code) {
			case 'P2002':
				return new ApiError(409, 'Cette ressource existe déjà', true, {
					field: err.meta?.target
				})
			case 'P2025':
				return new ApiError(404, 'Ressource non trouvée', true)
			case 'P2003':
				return new ApiError(400, 'Contrainte de clé étrangère violée', true)
			default:
				return new ApiError(400, 'Erreur de base de données', true, {
					code: err.code
				})
		}
	}

	if (err instanceof Prisma.PrismaClientValidationError) {
		return new ApiError(400, 'Données invalides', true)
	}

	// Erreur par défaut
	return new ApiError(
		err.statusCode || 500,
		err.message || 'Erreur interne du serveur',
		false
	)
}

/**
 * Middleware de gestion des erreurs
 * Doit être le dernier middleware
 */
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction
): void => {
	const apiError = convertToApiError(err)

	// Logger l'erreur
	if (!apiError.isOperational) {
		logger.error('Erreur non opérationnelle:', {
			message: apiError.message,
			stack: apiError.stack,
			path: req.path,
			method: req.method
		})
	} else if (process.env.NODE_ENV === 'development') {
		logger.warn('Erreur opérationnelle:', {
			message: apiError.message,
			statusCode: apiError.statusCode,
			path: req.path
		})
	}

	// Envoyer la réponse d'erreur
	sendError(
		res,
		apiError.message,
		apiError.statusCode,
		err.name || 'ERROR',
		process.env.NODE_ENV === 'development'
			? {
					...apiError.details,
					stack: apiError.stack
			  }
			: apiError.details
	)
}

/**
 * Middleware pour gérer les routes non trouvées
 */
export const notFoundHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	const error = new ApiError(
		404,
		`Route ${req.method} ${req.path} non trouvée`,
		true
	)
	next(error)
}
