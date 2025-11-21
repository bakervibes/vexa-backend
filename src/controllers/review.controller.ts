/**
 * Review Controller
 */

import {
	AddReviewInput,
	UpdateReviewInput
} from '@/validators/review.validator'
import { Request, Response } from 'express'
import * as reviewService from '../services/review.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get reviews for a product
 */
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
	const { productId } = req.params
	const result = await reviewService.getReviews(productId)
	sendSuccess(res, result, 'Reviews retrieved successfully')
})

/**
 * Add a review
 */
export const addReview = asyncHandler(async (req: Request, res: Response) => {
	const userId = (req as any).user.id
	const body = req.body as AddReviewInput
	const result = await reviewService.addReview(userId, body)
	sendSuccess(res, result, 'Review added successfully', 201)
})

/**
 * Update a review
 */
export const updateReview = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = (req as any).user.id
		const { id } = req.params
		const body = req.body as UpdateReviewInput
		const result = await reviewService.updateReview(userId, id, body)
		sendSuccess(res, result, 'Review updated successfully')
	}
)

/**
 * Delete a review
 */
export const deleteReview = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = (req as any).user.id
		const { id } = req.params
		const result = await reviewService.deleteReview(userId, id)
		sendSuccess(res, result, 'Review deleted successfully')
	}
)

/**
 * Approve review (Admin)
 */
export const approveReview = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params
		const result = await reviewService.approveReview(id)
		sendSuccess(res, result, 'Review approved successfully')
	}
)
