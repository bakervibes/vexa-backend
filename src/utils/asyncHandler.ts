import type { NextFunction, Request, Response } from 'express'

type ReqSchema = {
	body?: any
	params?: any
	query?: any
	user?: any
}

export const asyncHandler = <T extends ReqSchema = ReqSchema>(
	fn: (
		req: Request<T['params'], any, T['body'], T['query']> & {
			user?: T['user']
		},
		res: Response,
		next: NextFunction
	) => Promise<any>
) => {
	return (
		req: Request<T['params'], any, T['body'], T['query']> & {
			user?: T['user']
		},
		res: Response,
		next: NextFunction
	) => {
		Promise.resolve(fn(req, res, next)).catch(next)
	}
}
