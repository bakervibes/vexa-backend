import { createIntent, getPaymentStatus, handleWebhook } from '@/controllers/payment.controller'
import { authenticate } from '@/middlewares/auth'
import { validateBody, validateParams } from '@/middlewares/validate'
import { createPaymentIntentSchema, orderIdSchema } from '@/validators/payment.validator'
import type { Router as ExpressRouter } from 'express'
import express, { Router } from 'express'

const router: ExpressRouter = Router()

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent
 * @access  Private
 */
router.post('/create-intent', authenticate, validateBody(createPaymentIntentSchema), createIntent)

/**
 * @route   POST /api/payments/webhook
 * @desc    Payment webhook
 * @access  Public
 */
router.post(
	'/webhook',
	express.raw({ type: 'application/json' }), // Webhooks often need raw body
	handleWebhook
)

/**
 * @route   GET /api/payments/status/:orderId
 * @desc    Get payment status
 * @access  Private
 */
router.get('/status/:orderId', authenticate, validateParams(orderIdSchema), getPaymentStatus)

export default router
