import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import type { JwtPayload, TokenPair } from '../types/jwt'
import { UnauthorizedError } from './ApiError'

/**
 * Génère un access token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
	return jwt.sign(payload, config.jwt.secret, {
		expiresIn: config.jwt.expiresIn as any,
	})
}

/**
 * Génère un refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
	if (!config.jwt.refreshSecret) {
		throw new Error('JWT_REFRESH_SECRET non configuré')
	}

	return jwt.sign(payload, config.jwt.refreshSecret, {
		expiresIn: config.jwt.refreshExpiresIn as any,
	})
}

/**
 * Génère une paire de tokens (access + refresh)
 */
export const generateTokenPair = (payload: JwtPayload): TokenPair => {
	const accessToken = generateAccessToken(payload)

	let refreshToken: string | undefined
	if (config.jwt.refreshSecret) {
		refreshToken = generateRefreshToken(payload)
	}

	return {
		accessToken,
		refreshToken,
	}
}

/**
 * Vérifie et décode un access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
	try {
		const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
		return decoded
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new UnauthorizedError('Token expiré')
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError('Token invalide')
		}
		throw new UnauthorizedError('Échec de vérification du token')
	}
}

/**
 * Vérifie et décode un refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
	if (!config.jwt.refreshSecret) {
		throw new Error('JWT_REFRESH_SECRET non configuré')
	}

	try {
		const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload
		return decoded
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new UnauthorizedError('Refresh token expiré')
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError('Refresh token invalide')
		}
		throw new UnauthorizedError('Échec de vérification du refresh token')
	}
}

/**
 * Décode un token sans vérifier sa signature (utile pour debug)
 */
export const decodeToken = (token: string): JwtPayload | null => {
	try {
		return jwt.decode(token) as JwtPayload
	} catch {
		return null
	}
}
