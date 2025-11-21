import { env, prisma } from '@/config'
import { ForbiddenError, UnauthorizedError } from '@/utils/ApiError'
import type { Role } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
	userId: string
	iat: number
	exp: number
}

/**
 * Middleware d'authentification
 * Vérifie le token JWT et attache l'utilisateur à la requête
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		// 1. Récupérer le token du header Authorization
		const authHeader = req.headers.authorization

		if (!authHeader?.startsWith('Bearer ')) {
			throw new UnauthorizedError("Token d'authentification invalide")
		}

		const token = authHeader.split(' ')[1]

		if (!token) {
			throw new UnauthorizedError("Token d'authentification manquant")
		}

		// 2. Vérifier et décoder le token
		const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload

		// 3. Récupérer l'utilisateur de la base de données
		const user = await prisma.users.findUnique({
			where: { id: decoded.userId },
		})

		if (!user) {
			throw new UnauthorizedError('Utilisateur non trouvé')
		}

		// 4. Attacher l'utilisateur à la requête
		req.user = user
		req.userId = user.id

		next()
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			next(new UnauthorizedError('Token expiré'))
		} else if (error instanceof jwt.JsonWebTokenError) {
			next(new UnauthorizedError('Token invalide'))
		} else {
			next(error)
		}
	}
}

/**
 * Middleware optionnel - attache l'utilisateur s'il y a un token, sinon continue
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader?.startsWith('Bearer ')) {
			return next()
		}

		const token = authHeader.split(' ')[1]

		if (!token) {
			return next()
		}

		const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload

		const user = await prisma.users.findUnique({
			where: { id: decoded.userId },
		})

		if (user) {
			req.user = user
			req.userId = user.id
		}

		next()
	} catch {
		// En cas d'erreur, on continue sans utilisateur
		next()
	}
}

/**
 * Middleware de vérification de rôle
 */
export const requireRole = (...roles: Role[]) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) {
			throw new UnauthorizedError('Non authentifié')
		}

		if (!roles.includes(req.user.role)) {
			throw new ForbiddenError('Accès non autorisé pour ce rôle')
		}

		next()
	}
}

/**
 * Alias pour requireRole - plus lisible dans les routes
 */
export const authorize = requireRole
