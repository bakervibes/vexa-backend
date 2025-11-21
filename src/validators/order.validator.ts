import { z } from 'zod'

/**
 * Schema for creating an order
 */
export const createOrderSchema = z.object({
	shippingAddressId: z.string().cuid('Invalid address ID').optional(),
	billingAddressId: z.string().cuid('Invalid address ID').optional(),
	// If addresses are not saved, we might accept full address objects.
	// For now, let's assume we use saved addresses or provide address data.
	// Based on schema, addresses are stored as Json snapshots.
	// So we can accept address objects too.
	shippingAddress: z.any().optional(),
	billingAddress: z.any().optional(),
	paymentProvider: z.enum(['STRIPE', 'PAYPAL', 'MANUAL']).default('STRIPE')
})

/**
 * Schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
	status: z.enum([
		'PENDING',
		'PROCESSING',
		'SHIPPED',
		'DELIVERED',
		'CANCELLED',
		'REFUNDED'
	])
})

/**
 * Schema for order ID parameter
 */
export const orderIdSchema = z.object({
	id: z.string().cuid('Invalid order ID')
})

// Types
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
