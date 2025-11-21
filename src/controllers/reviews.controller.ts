/**
 * Review Controller
 */

import { UnauthorizedError } from '@/utils'
import type {
	AddReviewInput,
	ProductIdInput,
	ReviewIdInput,
	UpdateReviewInput,
} from '@/validators/review.validator'
import * as reviewService from '../services/review.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get reviews for a product
 */
export const getReviews = asyncHandler<{
	params: ProductIdInput
}>(async (req, res) => {
	const { productId } = req.params

	const result = await reviewService.getReviews(productId)

	sendSuccess(res, result, 'Reviews retrieved successfully')
})

/**
 * Add a review
 */
export const addReview = asyncHandler<{
	body: AddReviewInput
}>(async (req, res) => {
	const userId = req.user?.id

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
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
	const userId = req.user?.id

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
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
	const userId = req.user?.id

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
	}

	const { id } = req.params

	const result = await reviewService.deleteReview(userId, id)

	sendSuccess(res, result, 'Review deleted successfully')
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
