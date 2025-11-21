/**
 * Cart Controller
 */

import {
	AddToCartInput,
	UpdateCartItemInput
} from '@/validators/cart.validator'
import { Request, Response } from 'express'
import * as cartService from '../services/cart.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

// Helper to extract user or session ID
const getContext = (req: Request) => {
	const userId = (req as any).user?.id

	const sessionId = req.headers['x-session-id'] as string

	return { userId, sessionId }
}

/**
 * Get cart
 */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
	const { userId, sessionId } = getContext(req)
	const result = await cartService.getCart(userId, sessionId)
	sendSuccess(res, result, 'Cart retrieved successfully')
})

/**
 * Add item to cart
 */
export const addItem = asyncHandler(async (req: Request, res: Response) => {
	const { userId, sessionId } = getContext(req)
	const body = req.body as AddToCartInput
	const result = await cartService.addItem(userId, sessionId, body)
	sendSuccess(res, result, 'Item added to cart successfully')
})

/**
 * Update cart item
 */
export const updateItem = asyncHandler(async (req: Request, res: Response) => {
	const { userId, sessionId } = getContext(req)
	const { itemId } = req.params
	const body = req.body as UpdateCartItemInput
	const result = await cartService.updateItem(userId, sessionId, itemId, body)
	sendSuccess(res, result, 'Cart item updated successfully')
})

/**
 * Remove item from cart
 */
export const removeItem = asyncHandler(async (req: Request, res: Response) => {
	const { userId, sessionId } = getContext(req)
	const { itemId } = req.params
	const result = await cartService.removeItem(userId, sessionId, itemId)
	sendSuccess(res, result, 'Item removed from cart successfully')
})

/**
 * Clear cart
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
	const { userId, sessionId } = getContext(req)
	const result = await cartService.clearCart(userId, sessionId)
	sendSuccess(res, result, 'Cart cleared successfully')
})
