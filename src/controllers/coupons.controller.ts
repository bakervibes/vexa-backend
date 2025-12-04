/**
 * Coupon Controller
 */

import type { ApplyCouponInput } from '@/validators/coupons.validator'
import * as couponService from '../services/coupons.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Validate a coupon code
 * GET /coupons/validate?code=COUPON_CODE
 */
export const validateCoupon = asyncHandler<{
	query: { code: string }
}>(async (req, res) => {
	const code = req.query.code as string

	const result = await couponService.validateCoupon({ code })

	sendSuccess(res, result, 'Coupon is valid')
})

/**
 * Get coupon by code
 * GET /coupons/:code
 */
export const getCouponByCode = asyncHandler<{
	params: { code: string }
}>(async (req, res) => {
	const { code } = req.params

	const result = await couponService.validateCoupon({ code })

	sendSuccess(res, result, 'Coupon retrieved successfully !')
})

/**
 * Apply a coupon to calculate discount
 * POST /coupons/apply
 */
export const applyCoupon = asyncHandler<{
	body: ApplyCouponInput
}>(async (req, res) => {
	const data = req.body

	const result = await couponService.applyCoupon(data)

	sendSuccess(res, result, 'Coupon applied successfully')
})

/**
 * Get all active coupons (admin only)
 * GET /coupons
 */
export const getActiveCoupons = asyncHandler(async (_req, res) => {
	const result = await couponService.getActiveCoupons()

	sendSuccess(res, result, 'Active coupons retrieved successfully !')
})
