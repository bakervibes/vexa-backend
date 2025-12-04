import {
	addReview,
	approveReview,
	deleteReview,
	disapproveReview,
	getReviews,
	updateReview,
} from '@/controllers/reviews.controller'
import { strictLimiter } from '@/middlewares'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { validateBody, validateParams, validateQuery } from '@/middlewares/validate.middleware'
import {
	addReviewSchema,
	productIdSchema,
	reviewIdSchema,
	reviewsQuerySchema,
	updateReviewSchema,
} from '@/validators/reviews.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.get(
	'/product/:productId',
	strictLimiter,
	validateParams(productIdSchema),
	validateQuery(reviewsQuerySchema),
	getReviews
)

router.post('/', authenticate, validateBody(addReviewSchema), addReview)

router.patch(
	'/:id',
	authenticate,
	validateParams(reviewIdSchema),
	validateBody(updateReviewSchema),
	updateReview
)

router.delete('/:id', authenticate, validateParams(reviewIdSchema), deleteReview)

router.patch(
	'/:id/approve',
	authenticate,
	authorize('ADMIN'),
	validateParams(reviewIdSchema),
	approveReview
)

router.patch(
	'/:id/disapprove',
	authenticate,
	authorize('ADMIN'),
	validateParams(reviewIdSchema),
	disapproveReview
)

export default router
