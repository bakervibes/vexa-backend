import { createIntent, getPaymentStatus, handleWebhook } from '@/controllers/payments.controller'
import { authenticate } from '@/middlewares/auth.middleware'
import { validateBody, validateParams } from '@/middlewares/validate.middleware'
import { createPaymentIntentSchema, orderIdSchema } from '@/validators/payments.validator'
import type { Router as ExpressRouter } from 'express'
import express, { Router } from 'express'

const router: ExpressRouter = Router()

router.post('/create-intent', authenticate, validateBody(createPaymentIntentSchema), createIntent)

router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

router.get('/status/:orderId', authenticate, validateParams(orderIdSchema), getPaymentStatus)

export default router
