/**
 * Order Service
 */

import type {
	AddressInput,
	CreateOrderInput,
	UpdateOrderStatusInput,
} from '@/validators/order.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'
import * as cartService from './cart.service'

/**
 * Create order from cart
 */
export const createOrder = async (userId: string, data: CreateOrderInput) => {
	const { shippingAddressId, billingAddressId, shippingAddress, billingAddress, paymentProvider } =
		data

	// 1. Get user's cart
	const cart = await cartService.getCart(userId, undefined)

	if (!cart || cart.items.length === 0) {
		throw new BadRequestError('Cart is empty')
	}

	// 2. Resolve addresses
	let finalShippingAddress: AddressInput | undefined = shippingAddress
	let finalBillingAddress: AddressInput | undefined = billingAddress

	if (shippingAddressId) {
		const addr = await prisma.addresses.findUnique({
			where: { id: shippingAddressId },
		})
		if (!addr) throw new NotFoundError('Shipping address not found')
		// Map Prisma address to AddressInput (convert null to undefined)
		finalShippingAddress = {
			name: addr.name,
			street: addr.street,
			city: addr.city,
			country: addr.country,
			postalCode: addr.postalCode ?? undefined,
			phone: addr.phone ?? undefined,
		}
	}

	if (billingAddressId) {
		const addr = await prisma.addresses.findUnique({
			where: { id: billingAddressId },
		})
		if (!addr) throw new NotFoundError('Billing address not found')
		// Map Prisma address to AddressInput (convert null to undefined)
		finalBillingAddress = {
			name: addr.name,
			street: addr.street,
			city: addr.city,
			country: addr.country,
			postalCode: addr.postalCode ?? undefined,
			phone: addr.phone ?? undefined,
		}
	}

	if (!finalShippingAddress) {
		throw new BadRequestError('Shipping address is required')
	}

	if (!finalBillingAddress) {
		finalBillingAddress = finalShippingAddress
	}

	// 3. Calculate totals
	let totalAmount = 0
	const orderItemsData = []

	for (const item of cart.items) {
		const price = item.variant
			? item.variant.price || item.variant.basePrice
			: item.product.price || item.product.basePrice
		if (price === null || price === undefined) {
			throw new BadRequestError(`Price not found for product ${item.product.name}`)
		}

		totalAmount += price * item.quantity

		orderItemsData.push({
			productId: item.productId,
			variantId: item.variantId,
			quantity: item.quantity,
			price: price,
			data: {
				name: item.product.name,
				sku: item.variant?.sku,
				image: item.product.images[0],
			},
		})
	}

	// 4. Create order
	const order = await prisma.orders.create({
		data: {
			userId,
			orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			totalAmount,
			shippingAddress: finalShippingAddress,
			billingAddress: finalBillingAddress,
			status: 'PENDING',
			items: {
				create: orderItemsData,
			},
			payments: {
				create: {
					provider: paymentProvider,
					amount: totalAmount,
					status: 'PENDING',
				},
			},
		},
		include: {
			items: true,
			payments: true,
		},
	})

	// 5. Clear cart
	await cartService.clearCart(userId, undefined)

	return order
}

/**
 * Get user orders
 */
export const getUserOrders = async (userId: string) => {
	return prisma.orders.findMany({
		where: { userId },
		include: {
			items: true,
			payments: true,
		},
		orderBy: { createdAt: 'desc' },
	})
}

/**
 * Get order by ID
 */
export const getOrder = async (id: string, userId?: string) => {
	const order = await prisma.orders.findUnique({
		where: { id },
		include: {
			items: true,
			payments: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	})

	if (!order) {
		throw new NotFoundError('Order not found')
	}

	if (userId && order.userId !== userId) {
		throw new BadRequestError('Not authorized to view this order')
	}

	return order
}

/**
 * Update order status (Admin)
 */
export const updateStatus = async (id: string, data: UpdateOrderStatusInput) => {
	const order = await prisma.orders.findUnique({ where: { id } })
	if (!order) throw new NotFoundError('Order not found')

	return prisma.orders.update({
		where: { id },
		data: { status: data.status },
	})
}

/**
 * Cancel order
 */
export const cancelOrder = async (id: string, userId: string) => {
	const order = await prisma.orders.findUnique({ where: { id } })
	if (!order) throw new NotFoundError('Order not found')

	if (order.userId !== userId) {
		throw new BadRequestError('Not authorized to cancel this order')
	}

	if (order.status !== 'PENDING') {
		throw new BadRequestError('Cannot cancel order that is not pending')
	}

	return prisma.orders.update({
		where: { id },
		data: { status: 'CANCELLED' },
	})
}
