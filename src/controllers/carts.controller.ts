/**
 * Cart Controller
 */

import type {
	AddToCartInput,
	RemoveCartItemInput,
	UpdateCartItemInput,
} from '@/validators/carts.validator'
import * as cartService from '../services/carts.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get cart
 */
export const getCart = asyncHandler(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const result = await cartService.getCart(userId, sessionId)

	sendSuccess(res, result, 'Cart retrieved successfully !')
})

/**
 * Add item to cart
 */
export const addToCart = asyncHandler<{
	body: AddToCartInput
}>(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const data = req.body

	const result = await cartService.addToCart(userId, sessionId, data)

	sendSuccess(res, result, 'Product added to cart successfully')
})

/**
 * Update cart item
 */
export const updateCartItem = asyncHandler<{
	body: UpdateCartItemInput
}>(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const data = req.body

	const result = await cartService.updateCartItem(userId, sessionId, data)

	sendSuccess(res, result, 'Product updated successfully')
})

/**
 * Remove item from cart
 */
export const removeCartItem = asyncHandler<{
	body: RemoveCartItemInput
}>(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const data = req.body

	const result = await cartService.removeCartItem(userId, sessionId, data)

	sendSuccess(res, result, 'Product removed from cart successfully')
})

/**
 * Clear cart
 */
export const clearCart = asyncHandler(async (req, res) => {
	const userId = req.userId
	const sessionId = req.headers['x-session-id'] as string | undefined

	const result = await cartService.clearCart(userId, sessionId)

	sendSuccess(res, result, 'Cart cleared successfully')
})
