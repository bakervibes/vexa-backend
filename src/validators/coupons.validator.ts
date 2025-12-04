import { z } from 'zod'
import { couponCodeSchema } from './common.schemas'

// ========== Schémas spécifiques ==========

/**
 * Schema for applying a coupon (same as validate but requires cartTotal)
 */
export const applyCouponSchema = z.object({
	code: couponCodeSchema,
	cartTotal: z
		.number({ message: 'Le total du panier est requis' })
		.min(0, 'Le total du panier doit être positif'),
})

/**
 * Schema for getting coupon by code (query param)
 */
export const validateCouponSchema = z.object({
	code: z
		.string({ message: 'Le code coupon est requis' })
		.min(1, 'Le code coupon est requis')
		.trim()
		.toUpperCase(),
})

// ========== Types inférés ==========

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>
