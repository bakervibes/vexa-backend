/**
 * EXEMPLE DE CONTROLLER D'AUTHENTIFICATION
 * Renommer en auth.controller.ts pour l'utiliser
 */

import type { LoginInput, RefreshTokenInput, RegisterInput } from '@/validators/auth.validator'
import type { users } from '@prisma/client'
import * as authService from '../services/auth.service'
import { UnauthorizedError } from '../utils/ApiError'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Créer un nouveau compte
 */
export const register = asyncHandler<{
	body: RegisterInput
}>(async (req, res) => {
	const { email, password, name } = req.body

	const result = await authService.register({ email, password, name })

	sendSuccess(res, result, 'Compte créé avec succès', 201)
})

/**
 * Se connecter
 */
export const login = asyncHandler<{
	body: LoginInput
}>(async (req, res) => {
	const { email, password } = req.body

	const result = await authService.login({ email, password })

	sendSuccess(res, result, 'Connexion réussie')
})

/**
 * Rafraîchir le token
 */
export const refreshToken = asyncHandler<{
	body: RefreshTokenInput
}>(async (req, res) => {
	const { refreshToken } = req.body

	const result = await authService.refreshAccessToken({ refreshToken })

	sendSuccess(res, result, 'Token rafraîchi')
})

/**
 * Se déconnecter
 */
export const logout = asyncHandler<{
	body: RefreshTokenInput
}>(async (_req, res) => {
	// Ici vous pouvez implémenter une blacklist de tokens si nécessaire

	sendSuccess(res, null, 'Déconnexion réussie')
})

/**
 * Obtenir les infos de l'utilisateur connecté
 */
export const getMe = asyncHandler<{
	user: users
}>(async (req, res) => {
	if (!req.user) {
		throw new UnauthorizedError()
	}

	// Ne pas renvoyer le mot de passe
	const { password: _password, ...userWithoutPassword } = req.user

	sendSuccess(res, userWithoutPassword, 'Utilisateur récupéré')
})
