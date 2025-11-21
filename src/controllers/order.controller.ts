/**
 * Order Controller
 */

import {
	CreateOrderInput,
	UpdateOrderStatusInput
} from '@/validators/order.validator'
import { Request, Response } from 'express'
import * as orderService from '../services/order.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Create order
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
	const userId = (req as any).user.id
	const body = req.body as CreateOrderInput
	const result = await orderService.createOrder(userId, body)
	sendSuccess(res, result, 'Order created successfully', 201)
})

/**
 * Get user orders
 */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
	const userId = (req as any).user.id
	const result = await orderService.getUserOrders(userId)
	sendSuccess(res, result, 'Orders retrieved successfully')
})

/**
 * Get order details
 */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
	const userId = (req as any).user.id
	const { id } = req.params
	// If admin, userId check might be skipped in service or handled differently.
	// For now assuming user is checking their own order.
	const result = await orderService.getOrder(id, userId)
	sendSuccess(res, result, 'Order retrieved successfully')
})

/**
 * Update order status (Admin)
 */
export const updateStatus = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params
		const body = req.body as UpdateOrderStatusInput
		const result = await orderService.updateStatus(id, body)
		sendSuccess(res, result, 'Order status updated successfully')
	}
)

/**
 * Cancel order
 */
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
	const userId = (req as any).user.id
	const { id } = req.params
	const result = await orderService.cancelOrder(id, userId)
	sendSuccess(res, result, 'Order cancelled successfully')
})
