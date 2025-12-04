import * as authService from '@/services/auth.service'
import { UnauthorizedError } from '@/utils/ApiError'
import { asyncHandler } from '@/utils/asyncHandler'
import { sendSuccess } from '@/utils/response'
import type { LoginInput, RefreshTokenInput, RegisterInput } from '@/validators/auth.validator'

/**
 * Create a new account
 * POST /auth/register
 */
export const register = asyncHandler<{
	body: RegisterInput
}>(async (req, res) => {
	const data = req.body
	const sessionId = req.headers['x-session-id'] as string | undefined

	const result = await authService.register(data, sessionId)

	sendSuccess(res, result, 'Account created successfully', 201)
})

/**
 * Sign in
 * POST /auth/login
 */
export const login = asyncHandler<{
	body: LoginInput
}>(async (req, res) => {
	const data = req.body

	const result = await authService.login(data)

	sendSuccess(res, result, 'Login successful')
})

/**
 * Refresh token
 * POST /auth/refresh
 */
export const refreshToken = asyncHandler<{
	body: RefreshTokenInput
}>(async (req, res) => {
	const data = req.body

	const result = await authService.refreshAccessToken(data)

	sendSuccess(res, result, 'Token refreshed')
})

/**
 * Sign out
 * POST /auth/logout
 */
export const logout = asyncHandler(async (_req, res) => {
	// Implement token blacklist if needed
	sendSuccess(res, null, 'Logout successful')
})

/**
 * Get current user info
 * GET /auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new UnauthorizedError('Not authenticated !')
	}

	const { password: _password, ...userWithoutPassword } = req.user

	sendSuccess(res, userWithoutPassword, 'User retrieved')
})
