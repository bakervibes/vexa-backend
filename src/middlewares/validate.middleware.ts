import { ValidationError } from '@/utils/ApiError'
import type { NextFunction, Request, Response } from 'express'
import type { z, ZodError, ZodTypeAny } from 'zod'

/**
 * Fonction utilitaire pour formater les erreurs Zod
 */
const formatZodError = (error: ZodError) => {
	const details = error.issues.map((err: z.core.$ZodIssue) => ({
		field: err.path.join('.'),
		message: err.message,
	}))

	// Message global automatique : on join seulement les messages
	const globalMessage = details.map((d) => d.message).join(', ')

	return { details, globalMessage }
}

/**
 * Middleware générique de validation
 */
const createValidator =
	(type: 'body' | 'params' | 'query') =>
	<TSchema extends ZodTypeAny>(schema: TSchema) => {
		return async (req: Request, _res: Response, next: NextFunction) => {
			try {
				await schema.parseAsync(req[type])
				next()
			} catch (error) {
				const { details, globalMessage } = formatZodError(error as ZodError)
				next(new ValidationError(globalMessage, details))
			}
		}
	}

/**
 * Validation Body
 */
export const validateBody = createValidator('body')

/**
 * Validation Params
 */
export const validateParams = createValidator('params')

/**
 * Validation Query
 */
export const validateQuery = createValidator('query')
