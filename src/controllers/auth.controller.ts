import * as authService from '@/services/auth.service'
import { UnauthorizedError } from '@/utils/ApiError'
import { asyncHandler } from '@/utils/asyncHandler'
import { sendSuccess } from '@/utils/response'
import type { LoginInput, RefreshTokenInput, RegisterInput } from '@/validators/auth.validator'

/**
 * Créer un nouveau compte
 * POST /auth/register
 */
export const register = asyncHandler<{
	body: RegisterInput
}>(async (req, res) => {
	const data = req.body

	const result = await authService.register(data)

	sendSuccess(res, result, 'Compte créé avec succès', 201)
})

/**
 * Se connecter
 * POST /auth/login
 */
export const login = asyncHandler<{
	body: LoginInput
}>(async (req, res) => {
	const data = req.body

	const result = await authService.login(data)

	sendSuccess(res, result, 'Connexion réussie')
})

/**
 * Rafraîchir le token
 * POST /auth/refresh
 */
export const refreshToken = asyncHandler<{
	body: RefreshTokenInput
}>(async (req, res) => {
	const data = req.body

	const result = await authService.refreshAccessToken(data)

	sendSuccess(res, result, 'Token rafraîchi')
})

/**
 * Se déconnecter
 * POST /auth/logout
 */
export const logout = asyncHandler(async (_req, res) => {
	// Implémente une blacklist de tokens si nécessaire
	sendSuccess(res, null, 'Déconnexion réussie')
})

/**
 * Obtenir les infos de l'utilisateur connecté
 * GET /auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new UnauthorizedError('Non authentifié')
	}

	const { password: _password, ...userWithoutPassword } = req.user

	sendSuccess(res, userWithoutPassword, 'Utilisateur récupéré')
})
