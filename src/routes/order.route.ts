import {
	cancelOrder,
	createOrder,
	getOrder,
	getOrders,
	updateStatus
} from '@/controllers/order.controller'
import { authenticate, authorize } from '@/middlewares/auth'
import { validateBody, validateParams } from '@/middlewares/validate'
import {
	createOrderSchema,
	orderIdSchema,
	updateOrderStatusSchema
} from '@/validators/order.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', authenticate, validateBody(createOrderSchema), createOrder)

/**
 * @route   GET /api/orders
 * @desc    Get user orders
 * @access  Private
 */
router.get('/', authenticate, getOrders)

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details
 * @access  Private
 */
router.get('/:id', authenticate, validateParams(orderIdSchema), getOrder)

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put(
	'/:id/cancel',
	authenticate,
	validateParams(orderIdSchema),
	cancelOrder
)

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin)
 */
router.put(
	'/:id/status',
	authenticate,
	authorize('ADMIN'),
	validateParams(orderIdSchema),
	validateBody(updateOrderStatusSchema),
	updateStatus
)

export default router
