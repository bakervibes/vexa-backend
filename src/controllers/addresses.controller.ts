/**
 * Address Controller
 */

import { UnauthorizedError } from '@/utils'
import type {
	AddressIdInput,
	CreateAddressInput,
	UpdateAddressInput,
} from '@/validators/addresses.validator'
import * as addressService from '../services/addresses.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get all addresses for the current user
 */
export const getUserAddresses = asyncHandler(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const result = await addressService.getUserAddresses(userId)

	sendSuccess(res, result, 'Addresses retrieved successfully !')
})

/**
 * Get a single address by ID
 */
export const getAddress = asyncHandler<{
	params: AddressIdInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const { id } = req.params

	const result = await addressService.getAddress(id, userId)

	sendSuccess(res, result, 'Address retrieved successfully !')
})

/**
 * Create a new address
 */
export const createAddress = asyncHandler<{
	body: CreateAddressInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const data = req.body

	const result = await addressService.createAddress(userId, data)

	sendSuccess(res, result, 'Address created successfully !', 201)
})

/**
 * Update an address
 */
export const updateAddress = asyncHandler<{
	params: AddressIdInput
	body: UpdateAddressInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const { id } = req.params
	const data = req.body

	const result = await addressService.updateAddress(id, userId, data)

	sendSuccess(res, result, 'Address updated successfully !')
})

/**
 * Delete an address
 */
export const deleteAddress = asyncHandler<{
	params: AddressIdInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const { id } = req.params

	const result = await addressService.deleteAddress(id, userId)

	sendSuccess(res, result, 'Address deleted successfully !')
})

/**
 * Set an address as default
 */
export const setDefaultAddress = asyncHandler<{
	params: AddressIdInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const { id } = req.params

	const result = await addressService.setDefaultAddress(id, userId)

	sendSuccess(res, result, 'Default address updated successfully !')
})
