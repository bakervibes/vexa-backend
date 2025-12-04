import {
	addToCart,
	clearCart,
	getCart,
	removeCartItem,
	updateCartItem,
} from '@/controllers/carts.controller'
import { optionalAuth } from '@/middlewares/auth.middleware'
import { validateBody } from '@/middlewares/validate.middleware'
import {
	addToCartSchema,
	removeCartItemSchema,
	updateCartItemSchema,
} from '@/validators/carts.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.use(optionalAuth)

router.get('/', getCart)

router.post('/items', validateBody(addToCartSchema), addToCart)

router.patch('/items', validateBody(updateCartItemSchema), updateCartItem)

router.delete('/items', validateBody(removeCartItemSchema), removeCartItem)

router.delete('/', clearCart)

export default router
