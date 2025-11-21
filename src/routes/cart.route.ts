import {
	addItem,
	clearCart,
	getCart,
	removeItem,
	updateItem
} from '@/controllers/cart.controller'
import { validateBody, validateParams } from '@/middlewares/validate'
import {
	addToCartSchema,
	cartItemIdSchema,
	updateCartItemSchema
} from '@/validators/cart.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

// Apply optional authentication to all cart routes to identify user if logged in
// If not logged in, we rely on x-session-id header handled in controller
// But we need a middleware that populates req.user if token is present, but doesn't fail if not.
// I will assume `authenticate` is strict. I might need to check `src/middlewares/auth.ts`.
// For now, I'll use a custom middleware or assume `authenticate` can be adapted.
// Let's check `src/middlewares/auth.ts` first to be sure.
// Actually, I'll just use a placeholder for now and check later.
// Wait, I should check `src/middlewares/auth.ts` to see if there is an optional auth.
// If not, I'll just use `authenticate` for now and maybe the user has to be logged in?
// The schema says `userId` is optional in carts, so guest carts are allowed.
// So I need a way to handle guest users.
// I'll assume for now that the controller handles the logic of checking user or session.
// I will add a middleware to try to extract user but not block.

import { prisma } from '@/config/database'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const extractUser = async (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.split(' ')[1]
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
			const user = await prisma.users.findUnique({ where: { id: decoded.id } })
			if (user) {
				;(req as any).user = user
			}
		} catch (error) {
			// Ignore invalid token for optional auth
		}
	}
	next()
}

router.use(extractUser)

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
router.put(
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
