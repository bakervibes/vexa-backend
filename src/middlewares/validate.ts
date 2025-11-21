import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'
import { ValidationError } from '../utils/ApiError'

/**
 * Middleware de validation des requêtes avec Zod
 * Valide body, params, query et headers
 */
export const validate = (schema: z.ZodObject<any>) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				params: req.params,
				query: req.query,
				headers: req.headers
			})
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = error.issues.map((err: z.ZodIssue) => ({
					field: err.path.join('.'),
					message: err.message,
					code: err.code
				}))

				next(new ValidationError('Validation échouée', errors))
			} else {
				next(error)
			}
		}
	}
}

/**
 * Middleware de validation du body uniquement
 */
export const validateBody = (schema: z.ZodObject<any>) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.body = await schema.parseAsync(req.body)
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = error.issues.map((err: z.ZodIssue) => ({
					field: err.path.join('.'),
					message: err.message,
					code: err.code
				}))

				next(new ValidationError('Validation du body échouée', errors))
			} else {
				next(error)
			}
		}
	}
}

/**
 * Middleware de validation des params uniquement
 */
export const validateParams = (schema: z.ZodObject<any>) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.params = (await schema.parseAsync(req.params)) as any
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = error.issues.map((err: z.ZodIssue) => ({
					field: err.path.join('.'),
					message: err.message,
					code: err.code
				}))

				next(new ValidationError('Validation des paramètres échouée', errors))
			} else {
				next(error)
			}
		}
	}
}

/**
 * Middleware de validation des query params uniquement
 */
export const validateQuery = (schema: z.ZodObject<any>) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.query = (await schema.parseAsync(req.query)) as any
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = error.issues.map((err: z.ZodIssue) => ({
					field: err.path.join('.'),
					message: err.message,
					code: err.code
				}))

				next(new ValidationError('Validation de la query échouée', errors))
			} else {
				next(error)
			}
		}
	}
}
