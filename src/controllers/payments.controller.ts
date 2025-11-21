/**
 * Payment Controller
 */

import { BadRequestError, UnauthorizedError } from '@/utils'
import type { CreatePaymentIntentInput, OrderIdInput } from '@/validators/payment.validator'
import * as paymentService from '../services/payment.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Create payment intent
 */
export const createIntent = asyncHandler<{
	body: CreatePaymentIntentInput
}>(async (req, res) => {
	const userId = req.user?.id

	const data = req.body

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
	}

	const result = await paymentService.createPaymentIntent(userId, data)

	sendSuccess(res, result, 'Payment intent created successfully')
})

/**
 * Handle webhook
 */
export const handleWebhook = asyncHandler(async (req, res) => {
	const signature = req.headers['stripe-signature'] as string | undefined

	if (!signature) {
		throw new BadRequestError('Missing stripe signature')
	}

	const result = await paymentService.handleWebhook(req.body, signature)

	res.json(result)
})

/**
 * Get payment status
 */
export const getPaymentStatus = asyncHandler<{
	params: OrderIdInput
}>(async (req, res) => {
	const userId = req.user?.id

	const { orderId } = req.params

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
	}

	const result = await paymentService.getPaymentStatus(orderId, userId)

	sendSuccess(res, result, 'Payment status retrieved successfully')
})
