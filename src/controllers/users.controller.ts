import * as userService from '@/services/users.service'
import { UnauthorizedError } from '@/utils/ApiError'
import { asyncHandler } from '@/utils/asyncHandler'
import { sendSuccess } from '@/utils/response'
import type {
	ChangePasswordInput,
	UpdateProfileImageInput,
	UpdateProfileInput,
} from '@/validators/users.validator'

/**
 * Get current user profile
 * GET /users/me
 */
export const getProfile = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new UnauthorizedError('Not authenticated !')
	}

	const { password: _password, ...userWithoutPassword } = req.user

	sendSuccess(res, userWithoutPassword, 'Profile retrieved')
})

/**
 * Update current user profile
 * PATCH /users/me
 */
export const updateProfile = asyncHandler<{
	body: UpdateProfileInput
}>(async (req, res) => {
	if (!req.user) {
		throw new UnauthorizedError('Not authenticated !')
	}

	const updatedUser = await userService.updateProfile(req.user.id, req.body)

	sendSuccess(res, updatedUser, 'Profile updated successfully')
})

/**
 * Update profile image
 * PATCH /users/me/image
 */
export const updateProfileImage = asyncHandler<{
	body: UpdateProfileImageInput
}>(async (req, res) => {
	if (!req.user) {
		throw new UnauthorizedError('Not authenticated !')
	}

	const updatedUser = await userService.updateProfileImage(req.user.id, req.body.imageUrl)

	sendSuccess(res, updatedUser, 'Profile image updated successfully')
})

/**
 * Change password
 * PATCH /users/me/password
 */
export const changePassword = asyncHandler<{
	body: ChangePasswordInput
}>(async (req, res) => {
	if (!req.user) {
		throw new UnauthorizedError('Not authenticated !')
	}

	await userService.changePassword(req.user.id, req.body)

	sendSuccess(res, null, 'Password changed successfully')
})
