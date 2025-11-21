import { z } from 'zod'

/**
 * Schema for adding a review
 */
export const addReviewSchema = z.object({
	productId: z.string().cuid('Invalid product ID'),
	rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
	comment: z.string().optional(),
})

/**
 * Schema for updating a review
 */
export const updateReviewSchema = z.object({
	rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5').optional(),
	comment: z.string().optional(),
})

/**
 * Schema for review ID parameter
 */
export const reviewIdSchema = z.object({
	id: z.string().cuid('Invalid review ID'),
})

/**
 * Schema for product ID parameter
 */
export const productIdSchema = z.object({
	productId: z.string().cuid('Invalid product ID'),
})

// Types
export type AddReviewInput = z.infer<typeof addReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ReviewIdInput = z.infer<typeof reviewIdSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
