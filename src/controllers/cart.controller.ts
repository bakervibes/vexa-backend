/**
 * Cart Controller
 */

import type {
	AddToCartInput,
	CartItemIdInput,
	UpdateCartItemInput,
} from '@/validators/cart.validator'
import * as cartService from '../services/cart.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get cart
 */
export const getCart = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const sessionId = req.headers['x-session-id'] as string | undefined

	const result = await cartService.getCart(userId, sessionId)

	sendSuccess(res, result, 'Panier récupéré avec succès !')
})

/**
 * Add item to cart
 */
export const addItem = asyncHandler<{
	body: AddToCartInput
}>(async (req, res) => {
	const userId = req.user?.id
	const sessionId = req.headers['x-session-id'] as string | undefined

	const data = req.body

	const result = await cartService.addItem(userId, sessionId, data)

	sendSuccess(res, result, 'Produit ajouté au panier avec succès !')
})

/**
 * Update cart item
 */
export const updateItem = asyncHandler<{
	params: CartItemIdInput
	body: UpdateCartItemInput
}>(async (req, res) => {
	const userId = req.user?.id
	const sessionId = req.headers['x-session-id'] as string | undefined

	const { itemId } = req.params

	const data = req.body

	const result = await cartService.updateItem(userId, sessionId, itemId, data)

	sendSuccess(res, result, 'Produit modifié avec succès !')
})

/**
 * Remove item from cart
 */
export const removeItem = asyncHandler<{
	params: CartItemIdInput
}>(async (req, res) => {
	const userId = req.user?.id
	const sessionId = req.headers['x-session-id'] as string | undefined

	const { itemId } = req.params

	const result = await cartService.removeItem(userId, sessionId, itemId)

	sendSuccess(res, result, 'Produit supprimé du panier avec succès !')
})

/**
 * Clear cart
 */
export const clearCart = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const sessionId = req.headers['x-session-id'] as string | undefined

	const result = await cartService.clearCart(userId, sessionId)

	sendSuccess(res, result, 'Panier vidé avec succès !')
})
