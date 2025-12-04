/**
 * EXEMPLE DE SERVICE D'AUTHENTIFICATION
 * Renommer en auth.service.ts pour l'utiliser
 */

import type { LoginInput, RefreshTokenInput, RegisterInput } from '@/validators/auth.validator'
import { Role, type users } from '@prisma/client'
import { prisma } from '../config/database'
import type { TokenPair } from '../types/jwt'
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/ApiError'
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt'
import { comparePassword, hashPassword } from '../utils/password'

interface AuthResponse {
	user: users
	tokens: TokenPair
}

/**
 * Créer un nouveau compte utilisateur
 */
export const register = async (input: RegisterInput, sessionId?: string): Promise<AuthResponse> => {
	const { email, password, name } = input

	// Normaliser l'email (trim et lowercase)
	const normalizedEmail = email.trim().toLowerCase()

	// Vérifier si l'email existe déjà (recherche insensible à la casse)
	const existingUser = await prisma.users.findFirst({
		where: {
			email: {
				equals: normalizedEmail,
				mode: 'insensitive',
			},
		},
	})

	if (existingUser) {
		throw new ConflictError('A user with this email already exists !')
	}

	// Hasher le mot de passe
	const hashedPassword = await hashPassword(password)

	// Créer l'utilisateur
	const user = await prisma.users.create({
		data: {
			name,
			email: normalizedEmail,
			password: hashedPassword,
			role: Role.USER,
			isActive: true,
		},
	})

	// Générer les tokens
	const tokens = generateTokenPair({
		userId: user.id,
		email: user.email,
	})

	// Merge guest cart if session ID is provided
	if (sessionId) {
		await cartService.mergeCarts(user.id, sessionId)
	}

	return { user, tokens }
}

import * as cartService from './carts.service'

/**
 * Se connecter
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
	const { email, password } = input

	// Normaliser l'email (trim et lowercase)
	const normalizedEmail = email.trim().toLowerCase()

	// Trouver l'utilisateur (recherche insensible à la casse)
	const user = await prisma.users.findFirst({
		where: {
			email: {
				equals: normalizedEmail,
				mode: 'insensitive',
			},
		},
	})

	if (!user) {
		throw new UnauthorizedError('Email ou mot de passe incorrect !')
	}

	if (!user.password) {
		throw new BadRequestError("Cette méthode de connexion n'est pas supportée pour cet email !")
	}

	// Vérifier le mot de passe
	const isPasswordValid = await comparePassword(password, user.password)

	if (!isPasswordValid) {
		throw new UnauthorizedError('Email ou mot de passe incorrect !')
	}

	// Générer les tokens
	const tokens = generateTokenPair({
		userId: user.id,
		email: user.email,
	})

	// Merge guest cart if session ID is provided
	// if (sessionId) {
	// 	await cartService.mergeCarts(user.id, sessionId)
	// }

	return { user, tokens }
}

/**
 * Rafraîchir le token d'accès
 */
export const refreshAccessToken = async (input: RefreshTokenInput): Promise<TokenPair> => {
	const { refreshToken } = input

	if (!refreshToken) {
		throw new BadRequestError('Refresh token manquant !')
	}

	// Vérifier le refresh token
	const payload = verifyRefreshToken(refreshToken)

	// Vérifier que l'utilisateur existe toujours
	const user = await prisma.users.findUnique({
		where: { id: payload.userId },
	})

	if (!user) {
		throw new UnauthorizedError('Utilisateur non trouvé !')
	}

	// Générer de nouveaux tokens
	const tokens = generateTokenPair({
		userId: user.id,
		email: user.email,
	})

	return tokens
}
