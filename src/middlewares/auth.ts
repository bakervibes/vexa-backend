import { NextFunction, Request, Response } from 'express'
import { prisma } from '../config/database'
import { ForbiddenError, UnauthorizedError } from '../utils/ApiError'
import { verifyAccessToken } from '../utils/jwt'

/**
 * Middleware d'authentification - vérifie le token JWT
 */
export const authenticate = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Récupérer le token depuis le header Authorization
		const authHeader = req.headers.authorization

		if (!authHeader) {
			throw new UnauthorizedError("Token d'authentification manquant")
		}

		// Format attendu: "Bearer <token>"
		const parts = authHeader.split(' ')

		if (parts.length !== 2 || parts[0] !== 'Bearer') {
			throw new UnauthorizedError(
				'Format du token invalide. Utiliser: Bearer <token>'
			)
		}

		const token = parts[1]

		// Vérifier et décoder le token
		const payload = verifyAccessToken(token)

		// Récupérer l'utilisateur depuis la base de données
		const user = await prisma.users.findUnique({
			where: { id: payload.userId }
		})

		if (!user) {
			throw new UnauthorizedError('Utilisateur non trouvé')
		}

		// Vérifier que le compte est actif
		if (!user.isActive) {
			throw new UnauthorizedError('Compte désactivé')
		}

		// Ajouter l'utilisateur à la requête
		req.user = user
		req.userId = user.id

		next()
	} catch (error) {
		next(error)
	}
}

/**
 * Middleware d'authentification optionnel
 * Ne lance pas d'erreur si le token est absent
 */
export const authenticateOptional = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader) {
			return next()
		}

		const parts = authHeader.split(' ')

		if (parts.length !== 2 || parts[0] !== 'Bearer') {
			return next()
		}

		const token = parts[1]
		const payload = verifyAccessToken(token)

		const user = await prisma.users.findUnique({
			where: { id: payload.userId }
		})

		if (user) {
			req.user = user
			req.userId = user.id
		}

		next()
	} catch {
		// En cas d'erreur, on continue sans user
		next()
	}
}

/**
 * Middleware d'autorisation basé sur les rôles
 * À utiliser après authenticate()
 */
export const authorize = (...allowedRoles: string[]) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.user) {
			throw new UnauthorizedError('Authentification requise')
		}

		// Si pas de rôles spécifiés, on autorise tous les utilisateurs authentifiés
		if (allowedRoles.length === 0) {
			return next()
		}

		// Vérifier si l'utilisateur a l'un des rôles autorisés
		const userRole = (req.user as any).role // Adapter selon votre schéma Prisma

		if (!userRole || !allowedRoles.includes(userRole)) {
			throw new ForbiddenError("Vous n'avez pas les permissions nécessaires")
		}

		next()
	}
}

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres ressources
 * ou est un administrateur
 */
export const authorizeOwnerOrAdmin = (userIdParam: string = 'id') => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.user) {
			throw new UnauthorizedError('Authentification requise')
		}

		const requestedUserId = req.params[userIdParam]
		const currentUserId = req.user.id
		const userRole = (req.user as any).role

		// Autoriser si c'est son propre ID ou si l'utilisateur est admin
		if (requestedUserId === currentUserId || userRole === 'ADMIN') {
			return next()
		}

		throw new ForbiddenError(
			"Vous ne pouvez accéder qu'à vos propres ressources"
		)
	}
}
