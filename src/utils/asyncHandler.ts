import type { NextFunction, Request, Response } from 'express'

type ReqSchema = {
	body?: unknown
	params?: unknown
	query?: unknown
	user?: unknown
}

export const asyncHandler = <T extends ReqSchema = ReqSchema>(
	fn: (
		req: Request<
			T['params'] extends object ? T['params'] : Record<string, string>,
			any,
			T['body'] extends object ? T['body'] : unknown,
			T['query'] extends object ? T['query'] : unknown
		> & { user?: T['user'] },
		res: Response,
		next: NextFunction
	) => Promise<any>
) => {
	return (
		req: Request<
			T['params'] extends object ? T['params'] : Record<string, string>,
			any,
			T['body'] extends object ? T['body'] : unknown,
			T['query'] extends object ? T['query'] : unknown
		> & { user?: T['user'] },
		res: Response,
		next: NextFunction
	) => {
		Promise.resolve(fn(req, res, next)).catch((err) => next(err))
	}
}
