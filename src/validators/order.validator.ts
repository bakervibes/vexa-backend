import { z } from 'zod'

/**
 * Schema pour une adresse
 */
const addressSchema = z.object({
	name: z.string().min(1, 'Le nom est requis'),
	street: z.string().min(1, 'La rue est requise'),
	city: z.string().min(1, 'La ville est requise'),
	postalCode: z.string().optional(),
	country: z.string().min(1, 'Le pays est requis'),
	phone: z.string().optional(),
})

/**
 * Schema for creating an order
 */
export const createOrderSchema = z.object({
	shippingAddressId: z.string().cuid('Invalid address ID').optional(),
	billingAddressId: z.string().cuid('Invalid address ID').optional(),
	// Addresses as objects (will be stored as Json snapshots)
	shippingAddress: addressSchema.optional(),
	billingAddress: addressSchema.optional(),
	paymentProvider: z.enum(['STRIPE', 'PAYPAL', 'MANUAL']).default('STRIPE'),
})

/**
 * Schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
	status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
})

/**
 * Schema for order ID parameter
 */
export const orderIdSchema = z.object({
	id: z.string().cuid('Invalid order ID'),
})

// Types
export type AddressInput = z.infer<typeof addressSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
