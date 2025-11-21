/**
 * Types pour les tokens JWT
 */
export interface JwtPayload {
	userId: string
	email?: string
	role?: string
	iat?: number
	exp?: number
}

export interface TokenPair {
	accessToken: string
	refreshToken?: string
}
