import {
	cancelOrder,
	createOrder,
	getOrder,
	getOrderByNumber,
	getOrders,
	getUserOrders,
	updateStatus,
} from '@/controllers/orders.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { validateBody, validateParams } from '@/middlewares/validate.middleware'
import {
	createOrderSchema,
	orderIdSchema,
	orderNumberSchema,
	updateOrderStatusSchema,
} from '@/validators/orders.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.get('/', authenticate, authorize('ADMIN'), getOrders)

router.get('/me', authenticate, getUserOrders)

router.post('/', authenticate, validateBody(createOrderSchema), createOrder)

router.get(
	'/number/:orderNumber',
	authenticate,
	validateParams(orderNumberSchema),
	getOrderByNumber
)

router.get('/:id', authenticate, validateParams(orderIdSchema), getOrder)

router.patch(
	'/:id',
	authenticate,
	authorize('ADMIN'),
	validateParams(orderIdSchema),
	validateBody(updateOrderStatusSchema),
	updateStatus
)

router.patch('/:id/cancel', authenticate, validateParams(orderIdSchema), cancelOrder)

export default router
