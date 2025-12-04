import { z } from 'zod'
import { cuidSchema } from './common.schemas'

// ========== Schémas spécifiques ==========

export const addToWishlistSchema = z.object({
	productId: cuidSchema,
	variantId: cuidSchema.optional(),
})

export const removeWishlistItemSchema = z.object({
	productId: cuidSchema,
	variantId: cuidSchema.optional(),
})

// ========== Types inférés ==========

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>
export type RemoveWishlistItemInput = z.infer<typeof removeWishlistItemSchema>
