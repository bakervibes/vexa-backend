import { z } from 'zod'

/**
 * Schema for adding an item to the cart
 */
export const addToCartSchema = z.object({
	productId: z.string().cuid('Invalid product ID'),
	variantId: z.string().cuid('Invalid variant ID').optional(),
	quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
})

/**
 * Schema for updating a cart item
 */
export const updateCartItemSchema = z.object({
	quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

/**
 * Schema for cart item ID parameter
 */
export const cartItemIdSchema = z.object({
	itemId: z.string().cuid('Invalid cart item ID'),
})

// Types
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type CartItemIdInput = z.infer<typeof cartItemIdSchema>
