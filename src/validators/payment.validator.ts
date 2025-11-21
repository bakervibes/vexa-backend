import { z } from 'zod'

/**
 * Schema for creating a payment intent
 */
export const createPaymentIntentSchema = z.object({
	orderId: z.string().cuid('Invalid order ID')
})

/**
 * Schema for order ID parameter
 */
export const orderIdSchema = z.object({
	orderId: z.string().cuid('Invalid order ID')
})

// Types
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
