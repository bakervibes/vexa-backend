import { addItem, clearCart, getCart, removeItem, updateItem } from '@/controllers/cart.controller'
import { optionalAuth } from '@/middlewares/auth.middleware'
import { validateBody, validateParams } from '@/middlewares/validate.middleware'
import {
	addToCartSchema,
	cartItemIdSchema,
	updateCartItemSchema,
} from '@/validators/cart.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

// Apply optional authentication to all cart routes to identify user if logged in
// If not logged in, we rely on x-session-id header handled in controller
router.use(optionalAuth)

/**
 * @route   GET /api/cart
 * @desc    Get current cart
 * @access  Public (with session ID) or Private
 */
router.get('/', getCart)

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Public (with session ID) or Private
 */
router.post('/items', validateBody(addToCartSchema), addItem)

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Public (with session ID) or Private
 */
router.patch(
	'/items/:itemId',
	validateParams(cartItemIdSchema),
	validateBody(updateCartItemSchema),
	updateItem
)

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Public (with session ID) or Private
 */
router.delete('/items/:itemId', validateParams(cartItemIdSchema), removeItem)

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Public (with session ID) or Private
 */
router.delete('/', clearCart)

export default router
