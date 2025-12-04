import { z } from 'zod'
import { cuidSchema, quantitySchema } from './common.schemas'

// ========== Schémas spécifiques ==========

export const addToCartSchema = z.object({
	productId: cuidSchema,
	variantId: cuidSchema.optional(),
	quantity: quantitySchema,
})

export const updateCartItemSchema = z.object({
	productId: cuidSchema,
	variantId: cuidSchema.optional(),
	quantity: quantitySchema,
})

export const removeCartItemSchema = z.object({
	productId: cuidSchema,
	variantId: cuidSchema.optional(),
})

// ========== Types inférés ==========

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>
