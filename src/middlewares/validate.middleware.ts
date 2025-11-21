import { ValidationError } from '@/utils/ApiError'
import type { NextFunction, Request, Response } from 'express'
import type { z, ZodError, ZodTypeAny } from 'zod'

/**
 * Middleware de validation pour le body de la requête
 */
export const validateBody = <TSchema extends ZodTypeAny>(schema: TSchema) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.body)
			next()
		} catch (error) {
			const zodError = error as ZodError

			const details = zodError.issues.map((err: z.core.$ZodIssue) => ({
				field: err.path.join('.'),
				message: err.message,
			}))

			next(new ValidationError('Données du body invalides', details))
		}
	}
}

/**
 * Middleware de validation pour les params de la requête
 */
export const validateParams = <TSchema extends ZodTypeAny>(schema: TSchema) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.params)
			next()
		} catch (error) {
			const zodError = error as ZodError

			const details = zodError.issues.map((err: z.core.$ZodIssue) => ({
				field: err.path.join('.'),
				message: err.message,
			}))

			next(new ValidationError('Paramètres invalides', details))
		}
	}
}

/**
 * Middleware de validation pour la query de la requête
 */
export const validateQuery = <TSchema extends ZodTypeAny>(schema: TSchema) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.query)
			next()
		} catch (error) {
			const zodError = error as ZodError

			const details = zodError.issues.map((err: z.core.$ZodIssue) => ({
				field: err.path.join('.'),
				message: err.message,
			}))

			next(new ValidationError('Paramètres de requête invalides', details))
		}
	}
}
