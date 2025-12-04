/**
 * User Service - Handles user profile operations
 */

import type { users } from '@prisma/client'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/ApiError'
import { comparePassword, hashPassword } from '../utils/password'
import type { ChangePasswordInput, UpdateProfileInput } from '../validators/users.validator'

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<users | null> => {
	return prisma.users.findUnique({
		where: { id: userId },
	})
}

/**
 * Update user profile
 */
export const updateProfile = async (
	userId: string,
	input: UpdateProfileInput
): Promise<Omit<users, 'password'>> => {
	const { name, email, phone } = input

	// Check if user exists
	const user = await prisma.users.findUnique({
		where: { id: userId },
	})

	if (!user) {
		throw new NotFoundError('User not found !')
	}

	// If email is being changed, check if it's already taken
	if (email && email.toLowerCase() !== user.email.toLowerCase()) {
		const existingUser = await prisma.users.findFirst({
			where: {
				email: {
					equals: email.toLowerCase(),
					mode: 'insensitive',
				},
				id: { not: userId },
			},
		})

		if (existingUser) {
			throw new BadRequestError('This email is already in use !')
		}
	}

	// Update user
	const updatedUser = await prisma.users.update({
		where: { id: userId },
		data: {
			...(name && { name }),
			...(email && { email: email.toLowerCase() }),
			...(phone !== undefined && { phone }),
		},
	})

	// Remove password from response
	const { password: _, ...userWithoutPassword } = updatedUser
	return userWithoutPassword
}

/**
 * Update user profile image
 */
export const updateProfileImage = async (
	userId: string,
	imageUrl: string
): Promise<Omit<users, 'password'>> => {
	const updatedUser = await prisma.users.update({
		where: { id: userId },
		data: { image: imageUrl },
	})

	const { password: _, ...userWithoutPassword } = updatedUser
	return userWithoutPassword
}

/**
 * Change user password
 */
export const changePassword = async (userId: string, input: ChangePasswordInput): Promise<void> => {
	const { currentPassword, newPassword } = input

	// Get user with password
	const user = await prisma.users.findUnique({
		where: { id: userId },
	})

	if (!user) {
		throw new NotFoundError('User not found !')
	}

	// Check if user has a password (social login users might not)
	if (!user.password) {
		throw new BadRequestError('Cannot change password. This account uses social login !')
	}

	// Verify current password
	const isPasswordValid = await comparePassword(currentPassword, user.password)
	if (!isPasswordValid) {
		throw new UnauthorizedError('Current password is incorrect !')
	}

	// Check that new password is different from current
	const isSamePassword = await comparePassword(newPassword, user.password)
	if (isSamePassword) {
		throw new BadRequestError('New password must be different from current password !')
	}

	// Hash and update password
	const hashedPassword = await hashPassword(newPassword)
	await prisma.users.update({
		where: { id: userId },
		data: { password: hashedPassword },
	})
}
