import { z } from 'zod'
import { cuidSchema } from './common.schemas'

/**
 * Schema for creating a payment intent
 */
export const createPaymentIntentSchema = z.object({
	orderId: cuidSchema,
})

/**
 * Schema for order ID parameter
 */
export const orderIdSchema = z.object({
	orderId: cuidSchema,
})

// Types
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
