import type { users } from '@prisma/client'

declare global {
	namespace Express {
		interface Request {
			user?: users
			userId?: string
			sessionId?: string
		}
	}
}

export {}
