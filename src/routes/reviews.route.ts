import {
	addReview,
	approveReview,
	deleteReview,
	getReviews,
	updateReview,
} from '@/controllers/reviews.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { validateBody, validateParams } from '@/middlewares/validate.middleware'
import {
	addReviewSchema,
	productIdSchema,
	reviewIdSchema,
	updateReviewSchema,
} from '@/validators/review.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a product
 * @access  Public
 */
router.get('/product/:productId', validateParams(productIdSchema), getReviews)

/**
 * @route   POST /api/reviews
 * @desc    Add a review
 * @access  Private
 */
router.post('/', authenticate, validateBody(addReviewSchema), addReview)

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private
 */
router.patch(
	'/:id',
	authenticate,
	validateParams(reviewIdSchema),
	validateBody(updateReviewSchema),
	updateReview
)

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:id', authenticate, validateParams(reviewIdSchema), deleteReview)

/**
 * @route   PUT /api/reviews/:id/approve
 * @desc    Approve a review
 * @access  Private (Admin)
 */
router.patch(
	'/:id/approve',
	authenticate,
	authorize('ADMIN'),
	validateParams(reviewIdSchema),
	approveReview
)

export default router
