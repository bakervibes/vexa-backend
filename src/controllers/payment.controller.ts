/**
 * Payment Controller
 */

import type { CreatePaymentIntentInput } from '@/validators/payment.validator'
import type { Request, Response } from 'express'
import * as paymentService from '../services/payment.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Create payment intent
 */
export const createIntent = asyncHandler(async (req: Request, res: Response) => {
	const userId = req.user?.id
	const body = req.body as CreatePaymentIntentInput
	const result = await paymentService.createPaymentIntent(userId, body)
	sendSuccess(res, result, 'Payment intent created successfully')
})

/**
 * Handle webhook
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
	const signature = req.headers['stripe-signature'] as string
	const result = await paymentService.handleWebhook(req.body, signature)
	res.json(result)
})

/**
 * Get payment status
 */
export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
	const userId = req.user?.id
	const { orderId } = req.params
	const result = await paymentService.getPaymentStatus(orderId, userId)
	sendSuccess(res, result, 'Payment status retrieved successfully')
})
