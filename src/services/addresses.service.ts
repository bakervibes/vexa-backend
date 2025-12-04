/**
 * Address Service
 */

import type { CreateAddressInput, UpdateAddressInput } from '@/validators/addresses.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Get all addresses for a user
 */
export const getUserAddresses = async (userId: string) => {
	return prisma.addresses.findMany({
		where: { userId },
		orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
	})
}

/**
 * Get a single address by ID
 */
export const getAddress = async (id: string, userId: string) => {
	const address = await prisma.addresses.findUnique({
		where: { id },
	})

	if (!address) {
		throw new NotFoundError('Address not found !')
	}

	if (address.userId !== userId) {
		throw new BadRequestError('Address does not belong to user !')
	}

	return address
}

/**
 * Create a new address
 */
export const createAddress = async (userId: string, data: CreateAddressInput) => {
	const { name, email, street, city, country, phone, isDefault } = data

	// If this is the default address, unset other defaults
	if (isDefault) {
		await prisma.addresses.updateMany({
			where: { userId, isDefault: true },
			data: { isDefault: false },
		})
	}

	// Check if user has any addresses - if not, make this one default
	const existingAddresses = await prisma.addresses.count({
		where: { userId },
	})

	const shouldBeDefault = isDefault || existingAddresses === 0

	return prisma.addresses.create({
		data: {
			userId,
			name,
			email,
			phone,
			street,
			city,
			country,
			isDefault: shouldBeDefault,
		},
	})
}

/**
 * Update an address
 */
export const updateAddress = async (id: string, userId: string, data: UpdateAddressInput) => {
	const address = await prisma.addresses.findUnique({
		where: { id },
	})

	if (!address) {
		throw new NotFoundError('Address not found !')
	}

	if (address.userId !== userId) {
		throw new BadRequestError('Address does not belong to user !')
	}

	// Handle isDefault logic
	let finalIsDefault = data.isDefault !== undefined ? data.isDefault : address.isDefault

	// If trying to unset default, check if there are other addresses
	if (address.isDefault && data.isDefault === false) {
		const addressCount = await prisma.addresses.count({
			where: { userId },
		})

		// If this is the only address, it must remain default
		if (addressCount === 1) {
			finalIsDefault = true
		} else {
			// Set another address as default
			const nextAddress = await prisma.addresses.findFirst({
				where: { userId, id: { not: id } },
				orderBy: { createdAt: 'desc' },
			})

			if (nextAddress) {
				await prisma.addresses.update({
					where: { id: nextAddress.id },
					data: { isDefault: true },
				})
			}
		}
	}

	// If setting as default, unset other defaults
	if (finalIsDefault && !address.isDefault) {
		await prisma.addresses.updateMany({
			where: { userId, isDefault: true, id: { not: id } },
			data: { isDefault: false },
		})
	}

	return prisma.addresses.update({
		where: { id },
		data: {
			...(data.name !== undefined && { name: data.name }),
			...(data.email !== undefined && { email: data.email }),
			...(data.phone !== undefined && { phone: data.phone }),
			...(data.street !== undefined && { street: data.street }),
			...(data.city !== undefined && { city: data.city }),
			...(data.country !== undefined && { country: data.country }),
			isDefault: finalIsDefault,
		},
	})
}

/**
 * Delete an address
 */
export const deleteAddress = async (id: string, userId: string) => {
	const address = await prisma.addresses.findUnique({
		where: { id },
	})

	if (!address) {
		throw new NotFoundError('Address not found !')
	}

	if (address.userId !== userId) {
		throw new BadRequestError('Address does not belong to user !')
	}

	const existingOrder = await prisma.orders.findFirst({
		where: { addressId: id },
	})

	if (existingOrder) {
		throw new BadRequestError('Address is associated with an order and cannot be deleted !')
	}

	await prisma.addresses.delete({
		where: { id },
	})

	// If deleted address was default, set another one as default
	if (address.isDefault) {
		const nextAddress = await prisma.addresses.findFirst({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		})

		if (nextAddress) {
			await prisma.addresses.update({
				where: { id: nextAddress.id },
				data: { isDefault: true },
			})
		}
	}

	return { success: true }
}

/**
 * Set an address as default
 */
export const setDefaultAddress = async (id: string, userId: string) => {
	const address = await prisma.addresses.findUnique({
		where: { id },
	})

	if (!address) {
		throw new NotFoundError('Address not found !')
	}

	if (address.userId !== userId) {
		throw new BadRequestError('Address does not belong to user !')
	}

	// Unset other defaults
	await prisma.addresses.updateMany({
		where: { userId, isDefault: true },
		data: { isDefault: false },
	})

	// Set this one as default
	return prisma.addresses.update({
		where: { id },
		data: { isDefault: true },
	})
}
