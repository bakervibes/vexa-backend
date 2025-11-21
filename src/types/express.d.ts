import type { User } from '@prisma/client'

/**
 * Extension des types Express pour ajouter les propriétés personnalisées
 */
declare global {
	namespace Express {
		interface Request {
			user?: User
			userId?: string
		}
	}
}

export {}
