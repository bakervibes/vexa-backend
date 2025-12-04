/**
 * Wishlist Controller
 */

import type { AddToWishlistInput, RemoveWishlistItemInput } from '@/validators/wishlists.validator'
import * as wishlistService from '../services/wishlists.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const result = await wishlistService.getWishlist(userId, sessionId)

	sendSuccess(res, result, 'Wishlist retrieved successfully !')
})

/**
 * Add item to wishlist
 */
export const addToWishlist = asyncHandler<{
	body: AddToWishlistInput
}>(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const data = req.body

	const result = await wishlistService.addToWishlist(userId, sessionId, data)

	sendSuccess(res, result, 'Product added to wishlist successfully')
})

/**
 * Remove item from wishlist
 */
export const removeWishlistItem = asyncHandler<{
	body: RemoveWishlistItemInput
}>(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const data = req.body

	const result = await wishlistService.removeWishlistItem(userId, sessionId, data)

	sendSuccess(res, result, 'Product removed from wishlist successfully')
})

/**
 * Clear wishlist
 */
export const clearWishlist = asyncHandler(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const result = await wishlistService.clearWishlist(userId, sessionId)

	sendSuccess(res, result, 'Wishlist cleared successfully')
})
