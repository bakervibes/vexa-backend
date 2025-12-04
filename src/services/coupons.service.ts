/**
 * Coupon Service
 */
import type { ApplyCouponInput, ValidateCouponInput } from '@/validators/coupons.validator'
import type { coupons } from '@prisma/client'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Applied coupon response with discount calculation
 */
export interface AppliedCouponResponse extends coupons {
	discountAmount: number
	originalTotal: number
	finalTotal: number
}

/**
 * Get coupon by code
 */
export const getCouponByCode = async (code: string): Promise<coupons | null> => {
	const coupon = await prisma.coupons.findFirst({
		where: {
			code: code.toUpperCase(),
		},
	})

	return coupon
}

/**
 * Validate a coupon code
 * Checks if the coupon exists, is active, not expired, and has remaining usage
 */
export const validateCoupon = async (data: ValidateCouponInput): Promise<coupons> => {
	const { code } = data

	const coupon = await prisma.coupons.findFirst({
		where: { code },
	})

	if (!coupon) {
		throw new NotFoundError('Coupon not found !')
	}

	// Check if coupon is active
	if (!coupon.isActive) {
		throw new BadRequestError('This coupon is no longer active !')
	}

	// Check if coupon has expired
	if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
		throw new BadRequestError('This coupon has expired !')
	}

	// Check usage limit
	if (coupon.usageLimit !== null) {
		const usageCount = await prisma.orders.count({
			where: {
				couponId: coupon.id,
			},
		})

		if (usageCount >= coupon.usageLimit) {
			throw new BadRequestError('This coupon has reached its usage limit !')
		}
	}

	return coupon
}

/**
 * Calculate discount amount based on coupon type and cart total
 */
export const calculateDiscount = (
	coupon: coupons,
	cartTotal: number
): { discountAmount: number; finalTotal: number } => {
	let discountAmount: number

	if (coupon.type === 'PERCENTAGE') {
		// Percentage discount (value is the percentage, e.g., 10 for 10%)
		discountAmount = (cartTotal * coupon.value) / 100
	} else {
		// Fixed discount
		discountAmount = coupon.value
	}

	// Ensure discount doesn't exceed cart total
	discountAmount = Math.min(discountAmount, cartTotal)

	// Round to 2 decimal places
	discountAmount = Math.round(discountAmount * 100) / 100

	const finalTotal = Math.max(0, cartTotal - discountAmount)

	return {
		discountAmount,
		finalTotal: Math.round(finalTotal * 100) / 100,
	}
}

/**
 * Apply a coupon to a cart total
 * Validates the coupon and calculates the discount
 */
export const applyCoupon = async (data: ApplyCouponInput): Promise<AppliedCouponResponse> => {
	const { code, cartTotal } = data

	// First validate the coupon
	const coupon = await validateCoupon({ code })

	// Calculate the discount
	const { discountAmount, finalTotal } = calculateDiscount(coupon, cartTotal)

	return {
		...coupon,
		discountAmount,
		originalTotal: cartTotal,
		finalTotal,
	}
}

/**
 * Get all active coupons (for admin purposes)
 */
export const getActiveCoupons = async (): Promise<coupons[]> => {
	const coupons = await prisma.coupons.findMany({
		where: {
			isActive: true,
			OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return coupons
}
