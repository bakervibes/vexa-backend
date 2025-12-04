/**
 * Review Service
 */

import type {
	AddReviewInput,
	ReviewsQueryInput,
	UpdateReviewInput,
} from '@/validators/reviews.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

interface PaginatedReviewsResult {
	reviews: Awaited<ReturnType<typeof prisma.product_reviews.findMany>>
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasMore: boolean
	}
}

/**
 * Get reviews for a product (paginated)
 */
export const getReviews = async (
	productId: string,
	options: ReviewsQueryInput
): Promise<PaginatedReviewsResult> => {
	const page = Number(options.page)
	const limit = Number(options.limit)
	const skip = (page - 1) * limit

	const [reviews, total] = await Promise.all([
		prisma.product_reviews.findMany({
			where: {
				productId,
				isApproved: true,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip,
			take: limit,
		}),
		prisma.product_reviews.count({
			where: {
				productId,
				isApproved: true,
			},
		}),
	])

	const totalPages = Math.ceil(total / limit)

	return {
		reviews,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasMore: page < totalPages,
		},
	}
}

/**
 * Add a review
 */
export const addReview = async (userId: string, data: AddReviewInput) => {
	const { productId, rating, comment } = data

	// Check if product exists
	const product = await prisma.products.findUnique({
		where: { id: productId },
	})

	if (!product) {
		throw new NotFoundError('Product not found !')
	}

	// // Check if user has already reviewed this product
	// const existingReview = await prisma.product_reviews.findFirst({
	// 	where: {
	// 		productId,
	// 		userId,
	// 	},
	// })

	// if (existingReview) {
	// 	throw new BadRequestError('You have already reviewed this product')
	// }

	return prisma.product_reviews.create({
		data: {
			productId,
			userId,
			rating,
			comment,
			isApproved: true,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})
}

/**
 * Update a review
 */
export const updateReview = async (userId: string, reviewId: string, data: UpdateReviewInput) => {
	const review = await prisma.product_reviews.findUnique({
		where: { id: reviewId },
	})

	if (!review) {
		throw new NotFoundError('Review not found !')
	}

	if (review.userId !== userId) {
		throw new BadRequestError('Not authorized to update this review !')
	}

	return prisma.product_reviews.update({
		where: { id: reviewId },
		data,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})
}

/**
 * Delete a review
 */
export const deleteReview = async (userId: string, reviewId: string) => {
	const review = await prisma.product_reviews.findUnique({
		where: { id: reviewId },
	})

	if (!review) {
		throw new NotFoundError('Review not found !')
	}

	if (review.userId !== userId) {
		throw new BadRequestError('Not authorized to delete this review !')
	}

	return prisma.product_reviews.delete({
		where: { id: reviewId },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})
}

/**
 * Approve review (Admin)
 */
export const approveReview = async (reviewId: string) => {
	const review = await prisma.product_reviews.findUnique({
		where: { id: reviewId },
	})

	if (!review) {
		throw new NotFoundError('Review not found !')
	}

	return prisma.product_reviews.update({
		where: { id: reviewId },
		data: { isApproved: true },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})
}

/**
 * Disapprove review (Admin)
 */
export const disapproveReview = async (reviewId: string) => {
	const review = await prisma.product_reviews.findUnique({
		where: { id: reviewId },
	})

	if (!review) {
		throw new NotFoundError('Review not found !')
	}

	if (!review.isApproved) {
		throw new BadRequestError('Review already disapproved !')
	}

	return prisma.product_reviews.update({
		where: { id: reviewId },
		data: { isApproved: false },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})
}
