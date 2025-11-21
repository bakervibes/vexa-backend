/**
 * Order Controller
 */

import { UnauthorizedError } from '@/utils'
import type {
	CreateOrderInput,
	OrderIdInput,
	UpdateOrderStatusInput,
} from '@/validators/order.validator'
import * as orderService from '../services/order.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Create order
 */
export const createOrder = asyncHandler<{
	body: CreateOrderInput
}>(async (req, res) => {
	const userId = req.user?.id

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
	}

	const data = req.body

	const result = await orderService.createOrder(userId, data)

	sendSuccess(res, result, 'Order created successfully', 201)
})

/**
 * Get user orders
 */
export const getOrders = asyncHandler(async (req, res) => {
	const userId = req.user?.id

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
	}

	const result = await orderService.getUserOrders(userId)

	sendSuccess(res, result, 'Orders retrieved successfully')
})

/**
 * Get order details
 */
export const getOrder = asyncHandler<{
	params: OrderIdInput
}>(async (req, res) => {
	const userId = req.user?.id

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
	}

	const { id } = req.params

	const result = await orderService.getOrder(id, userId)

	sendSuccess(res, result, 'Order retrieved successfully')
})

/**
 * Update order status (Admin)
 */
export const updateStatus = asyncHandler<{
	params: OrderIdInput
	body: UpdateOrderStatusInput
}>(async (req, res) => {
	const { id } = req.params

	const data = req.body

	const result = await orderService.updateStatus(id, data)
	sendSuccess(res, result, 'Order status updated successfully')
})

/**
 * Cancel order
 */
export const cancelOrder = asyncHandler<{
	params: OrderIdInput
}>(async (req, res) => {
	const userId = req.user?.id

	if (!userId) {
		throw new UnauthorizedError('Utilisateur non connecté')
	}

	const { id } = req.params

	const result = await orderService.cancelOrder(id, userId)

	sendSuccess(res, result, 'Order cancelled successfully')
})
