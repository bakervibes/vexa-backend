/**
 * Payment Service
 */

import type { CreatePaymentIntentInput } from '@/validators/payment.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

// Mock Stripe/PayPal integration for now
// In a real app, we would import Stripe SDK here

/**
 * Create payment intent
 */
export const createPaymentIntent = async (userId: string, data: CreatePaymentIntentInput) => {
	const { orderId } = data

	const order = await prisma.orders.findUnique({
		where: { id: orderId },
		include: {
			payments: true,
		},
	})

	if (!order) {
		throw new NotFoundError('Order not found')
	}

	if (order.userId !== userId) {
		throw new BadRequestError('Not authorized to pay for this order')
	}

	if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
		throw new BadRequestError('Cannot pay for cancelled or refunded order')
	}

	// Check if already paid
	const completedPayment = order.payments.find((p) => p.status === 'COMPLETED')
	if (completedPayment) {
		throw new BadRequestError('Order is already paid')
	}

	// Mock payment intent creation
	const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`

	// Update or create payment record
	// We might already have a pending payment from order creation
	const pendingPayment = order.payments.find((p) => p.status === 'PENDING')

	if (pendingPayment) {
		await prisma.payments.update({
			where: { id: pendingPayment.id },
			data: {
				transactionId: `pi_${Date.now()}`, // Mock transaction ID
			},
		})
	} else {
		await prisma.payments.create({
			data: {
				orderId,
				provider: 'STRIPE', // Defaulting to Stripe for now
				amount: order.totalAmount,
				status: 'PENDING',
				transactionId: `pi_${Date.now()}`,
			},
		})
	}

	return {
		clientSecret,
		amount: order.totalAmount,
		currency: order.currency,
	}
}

/**
 * Handle webhook (Mock)
 */
export const handleWebhook = async (_payload: any, _signature: string) => {
	// Verify signature and process event
	// This is a placeholder for actual webhook handling
	return { received: true }
}

/**
 * Get payment status
 */
export const getPaymentStatus = async (orderId: string, userId: string) => {
	const order = await prisma.orders.findUnique({
		where: { id: orderId },
		include: {
			payments: true,
		},
	})

	if (!order) {
		throw new NotFoundError('Order not found')
	}

	if (order.userId !== userId) {
		throw new BadRequestError('Not authorized to view this order')
	}

	return order.payments
}
