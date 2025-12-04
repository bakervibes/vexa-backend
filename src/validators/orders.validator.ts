import { OrderStatus, PaymentProvider } from '@prisma/client'
import { z } from 'zod'
import { addressSchema, cuidSchema } from './common.schemas'

// Enum pour order status
const orderStatusEnum = z.enum(OrderStatus)

// ========== Schémas spécifiques ==========

/**
 * Schema for shipping option
 * All fields have defaults for vee-validate-zod compatibility
 */
export const shippingOptionSchema = z.object({
	id: z.string().min(1, 'Shipping option ID is required'),
	label: z.string().min(1, 'Shipping option label is required'),
	price: z.number().min(0, 'Le prix doit être positif'),
	isPercentage: z.boolean(),
})

/**
 * Schema for payment
 * All fields have defaults for vee-validate-zod compatibility
 */
export const paymentProviderSchema = z.object({
	provider: z.enum(PaymentProvider),
	transactionId: z.string(),
	metadata: z.record(z.string(), z.any()),
})

/**
 * Schema for coupon code (nullable)
 */
const couponSchema = z
	.string()
	.min(1, 'Le code coupon est requis')
	.max(50, 'Le code coupon ne peut pas dépasser 50 caractères')
	.trim()
	.toUpperCase()
	.nullable()

/**
 * Schema for creating an order
 */
export const createOrderSchema = z.object({
	address: addressSchema,
	payment: paymentProviderSchema,
	coupon: couponSchema,
	shippingOption: shippingOptionSchema,
})

export const updateOrderStatusSchema = z.object({
	status: orderStatusEnum,
})

export const orderIdSchema = z.object({
	id: cuidSchema,
})

export const orderNumberSchema = z.object({
	orderNumber: z.string().min(1, 'Order number is required'),
})

// ========== Types inférés ==========

export type ShippingOptionInput = z.infer<typeof shippingOptionSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
export type OrderNumberInput = z.infer<typeof orderNumberSchema>
