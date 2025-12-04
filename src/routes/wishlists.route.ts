import {
	addToWishlist,
	clearWishlist,
	getWishlist,
	removeWishlistItem,
} from '@/controllers/wishlists.controller'
import { optionalAuth } from '@/middlewares/auth.middleware'
import { validateBody } from '@/middlewares/validate.middleware'
import { addToWishlistSchema, removeWishlistItemSchema } from '@/validators/wishlists.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.use(optionalAuth)

router.get('/', getWishlist)

router.post('/items', validateBody(addToWishlistSchema), addToWishlist)

router.delete('/items', validateBody(removeWishlistItemSchema), removeWishlistItem)

router.delete('/', clearWishlist)

export default router
