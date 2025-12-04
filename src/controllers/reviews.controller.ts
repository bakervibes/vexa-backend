/**
 * Review Controller
 */

import { UnauthorizedError } from '@/utils'
import type {
	AddReviewInput,
	ProductIdInput,
	ReviewIdInput,
	ReviewsQueryInput,
	UpdateReviewInput,
} from '@/validators/reviews.validator'
import * as reviewService from '../services/reviews.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get reviews for a product (paginated)
 */
export const getReviews = asyncHandler<{
	params: ProductIdInput
	query: ReviewsQueryInput
}>(async (req, res) => {
	const { productId } = req.params
	const { page, limit } = req.query

	const result = await reviewService.getReviews(productId, { page, limit })

	sendSuccess(res, result, 'Reviews retrieved successfully !')
})

/**
 * Add a review
 */
export const addReview = asyncHandler<{
	body: AddReviewInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const data = req.body

	const result = await reviewService.addReview(userId, data)

	sendSuccess(res, result, 'Review added successfully', 201)
})

/**
 * Update a review
 */
export const updateReview = asyncHandler<{
	params: ReviewIdInput
	body: UpdateReviewInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const { id } = req.params

	const data = req.body

	const result = await reviewService.updateReview(userId, id, data)

	sendSuccess(res, result, 'Review updated successfully')
})

/**
 * Delete a review
 */
export const deleteReview = asyncHandler<{
	params: ReviewIdInput
}>(async (req, res) => {
	const userId = req.userId

	if (!userId) {
		throw new UnauthorizedError('User not logged in !')
	}

	const { id } = req.params

	const result = await reviewService.deleteReview(userId, id)

	sendSuccess(res, result, 'Review deleted successfully !')
})

/**
 * Approve review (Admin)
 */
export const approveReview = asyncHandler<{
	params: ReviewIdInput
}>(async (req, res) => {
	const { id } = req.params

	const result = await reviewService.approveReview(id)

	sendSuccess(res, result, 'Review approved successfully')
})

/**
 * Disapprove review (Admin)
 */
export const disapproveReview = asyncHandler<{
	params: ReviewIdInput
}>(async (req, res) => {
	const { id } = req.params

	const result = await reviewService.disapproveReview(id)

	sendSuccess(res, result, 'Review disapproved successfully')
})
