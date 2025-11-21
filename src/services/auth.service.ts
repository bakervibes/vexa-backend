/**
 * EXEMPLE DE SERVICE D'AUTHENTIFICATION
 * Renommer en auth.service.ts pour l'utiliser
 */

import {
	LoginInput,
	RefreshTokenInput,
	RegisterInput
} from '@/validators/auth.validator'
import { users } from '@prisma/client'
import { prisma } from '../config/database'
import { TokenPair } from '../types/jwt'
import {
	BadRequestError,
	ConflictError,
	UnauthorizedError
} from '../utils/ApiError'
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt'
import { comparePassword, hashPassword } from '../utils/password'

interface AuthResponse {
	user: users
	tokens: TokenPair
}

/**
 * Créer un nouveau compte utilisateur
 */
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
	const { email, password, name } = input

	// Vérifier si l'email existe déjà
	const existingUser = await prisma.users.findUnique({
		where: { email }
	})

	if (existingUser) {
		throw new ConflictError('Un compte avec cet email existe déjà')
	}

	// Hasher le mot de passe
	const hashedPassword = await hashPassword(password)

	// Créer l'utilisateur
	const user = await prisma.users.create({
		data: {
			email,
			password: hashedPassword,
			name
		}
	})

	// Générer les tokens
	const tokens = generateTokenPair({
		userId: user.id,
		email: user.email
	})

	return { user, tokens }
}

/**
 * Se connecter
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
	const { email, password } = input

	// Trouver l'utilisateur
	const user = await prisma.users.findUnique({
		where: { email }
	})

	if (!user) {
		throw new UnauthorizedError('Email ou mot de passe incorrect')
	}

	if (!user.password) {
		throw new BadRequestError(
			"Cette méthode de connexion n'est pas supportée pour cet email"
		)
	}

	// Vérifier le mot de passe
	const isPasswordValid = await comparePassword(password, user.password)

	if (!isPasswordValid) {
		throw new UnauthorizedError('Email ou mot de passe incorrect')
	}

	// Générer les tokens
	const tokens = generateTokenPair({
		userId: user.id,
		email: user.email
	})

	return { user, tokens }
}

/**
 * Rafraîchir le token d'accès
 */
export const refreshAccessToken = async (
	input: RefreshTokenInput
): Promise<TokenPair> => {
	const { refreshToken } = input

	if (!refreshToken) {
		throw new BadRequestError('Refresh token manquant')
	}

	// Vérifier le refresh token
	const payload = verifyRefreshToken(refreshToken)

	// Vérifier que l'utilisateur existe toujours
	const user = await prisma.users.findUnique({
		where: { id: payload.userId }
	})

	if (!user) {
		throw new UnauthorizedError('Utilisateur non trouvé')
	}

	// Générer de nouveaux tokens
	const tokens = generateTokenPair({
		userId: user.id,
		email: user.email
	})

	return tokens
}
