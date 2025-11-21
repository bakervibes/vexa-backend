/**
 * Review Service
 */

import {
	AddReviewInput,
	UpdateReviewInput
} from '@/validators/review.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Get reviews for a product
 */
export const getReviews = async (productId: string) => {
	const reviews = await prisma.product_reviews.findMany({
		where: {
			productId,
			isApproved: true
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	return reviews
}

/**
 * Add a review
 */
export const addReview = async (userId: string, data: AddReviewInput) => {
	const { productId, rating, comment } = data

	// Check if product exists
	const product = await prisma.products.findUnique({
		where: { id: productId }
	})

	if (!product) {
		throw new NotFoundError('Product not found')
	}

	// Check if user has already reviewed this product
	const existingReview = await prisma.product_reviews.findFirst({
		where: {
			productId,
			userId
		}
	})

	if (existingReview) {
		throw new BadRequestError('You have already reviewed this product')
	}

	// Check if user has purchased the product (optional, but good practice)
	// For now, we'll allow reviews without purchase check or implement it if needed.
	// Let's assume we want to allow anyone to review for now, or maybe check orders.
	// I'll skip purchase check for simplicity unless requested.

	const review = await prisma.product_reviews.create({
		data: {
			productId,
			userId,
			rating,
			comment,
			isApproved: false // Requires admin approval? Schema default is false.
		}
	})

	return review
}

/**
 * Update a review
 */
export const updateReview = async (
	userId: string,
	reviewId: string,
	data: UpdateReviewInput
) => {
	const review = await prisma.product_reviews.findUnique({
		where: { id: reviewId }
	})

	if (!review) {
		throw new NotFoundError('Review not found')
	}

	if (review.userId !== userId) {
		throw new BadRequestError('Not authorized to update this review')
	}

	const updatedReview = await prisma.product_reviews.update({
		where: { id: reviewId },
		data: {
			...data,
			isApproved: false // Re-approval needed after update?
		}
	})

	return updatedReview
}

/**
 * Delete a review
 */
export const deleteReview = async (userId: string, reviewId: string) => {
	const review = await prisma.product_reviews.findUnique({
		where: { id: reviewId }
	})

	if (!review) {
		throw new NotFoundError('Review not found')
	}

	// Allow user to delete their own review
	// Admin deletion should be handled separately or via role check in controller
	if (review.userId !== userId) {
		// We might want to allow admins to delete any review.
		// But here we check for owner.
		// Let's assume this function is for user actions.
		throw new BadRequestError('Not authorized to delete this review')
	}

	await prisma.product_reviews.delete({
		where: { id: reviewId }
	})

	return { message: 'Review deleted successfully' }
}

/**
 * Approve review (Admin)
 */
export const approveReview = async (reviewId: string) => {
	const review = await prisma.product_reviews.findUnique({
		where: { id: reviewId }
	})

	if (!review) {
		throw new NotFoundError('Review not found')
	}

	return prisma.product_reviews.update({
		where: { id: reviewId },
		data: { isApproved: true }
	})
}
