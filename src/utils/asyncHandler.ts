import type { NextFunction, Request, Response } from 'express'

/**
 * Schema de typage pour les requêtes
 * Utilise 'unknown' comme défaut pour permettre aux middlewares de validation
 * de raffiner les types via Zod
 */
type ReqSchema = {
	body?: unknown
	params?: unknown
	query?: unknown
	user?: unknown
}

/**
 * AsyncHandler avec typage strict
 * Les types génériques permettent de spécifier les types attendus après validation
 */
export const asyncHandler = <T extends ReqSchema = ReqSchema>(
	fn: (
		req: Request<
			T['params'] extends object ? T['params'] : Record<string, string>,
			unknown,
			T['body'] extends object ? T['body'] : unknown,
			T['query'] extends object ? T['query'] : unknown
		> & {
			user?: T['user']
		},
		res: Response,
		next: NextFunction
	) => Promise<unknown>
) => {
	return (
		req: Request<
			T['params'] extends object ? T['params'] : Record<string, string>,
			unknown,
			T['body'] extends object ? T['body'] : unknown,
			T['query'] extends object ? T['query'] : unknown
		> & {
			user?: T['user']
		},
		res: Response,
		next: NextFunction
	) => {
		Promise.resolve(fn(req, res, next)).catch(next)
	}
}
