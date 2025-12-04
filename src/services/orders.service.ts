/**
 * Order Service
 */

import type { CreateOrderInput, UpdateOrderStatusInput } from '@/validators/orders.validator'
import type { addresses, coupons, order_items, orders, payments, users } from '@prisma/client'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'
import * as cartService from './carts.service'

/**
 * Commande avec items et paiements
 * Correspond au retour de createOrder et getUserOrders
 */
export interface OrderItemData {
	name: string
	sku: string
	quantity: number
	price: number
	image: string
	variant: { sku: string; options: { attribute: string; option: string }[] } | null
}

export type OrderWithData = Omit<order_items, 'data'> & { data: OrderItemData }

export interface UserOrder extends orders {
	items: OrderWithData[]
	payments: payments[]
	coupon: coupons | null
}

/**
 * Commande avec items, paiements et informations utilisateur
 * Correspond au retour de getOrder (détail d'une commande)
 */
export interface OrderDetails extends UserOrder {
	user: Pick<users, 'id' | 'name' | 'email'>
}

/**
 * Calculate shipping cost based on shipping option and subtotal
 */
const calculateShippingCost = (
	shippingOption: { id: string; label: string; price: number; isPercentage: boolean },
	subtotal: number
): number => {
	if (shippingOption.isPercentage) {
		return (subtotal * shippingOption.price) / 100
	}
	return shippingOption.price
}

/**
 * Create order from cart
 */
export const createOrder = async (userId: string, data: CreateOrderInput) => {
	const { address, payment, coupon, shippingOption } = data
	const { id: _, ...addressData } = address

	// 1. Get user's cart
	const cart = await cartService.getCart(userId, undefined)

	if (!cart || cart.items.length === 0) {
		throw new BadRequestError('Cart is empty !')
	}

	// 2. Resolve address
	let finalAddress: addresses

	if (address.id) {
		const addr = await prisma.addresses.findUnique({
			where: { id: address.id },
		})

		if (!addr) throw new NotFoundError('Address not found !')

		// Check if address belongs to user
		if (addr.userId !== userId) {
			throw new BadRequestError('Address does not belong to user !')
		}

		// Si address est différent de addr (une différence d'une seule valeur suffit)
		const isAddressDifferent = Object.entries(addressData).some(([key, value]) => {
			return addr[key as keyof typeof addr] !== value
		})

		if (isAddressDifferent) {
			finalAddress = await prisma.addresses.update({
				where: { id: address.id },
				data: addressData,
			})
		} else {
			finalAddress = addr
		}
	} else {
		const existingAddress = await prisma.addresses.findFirst({
			where: { userId, isDefault: true },
		})

		finalAddress = await prisma.addresses.create({
			data: {
				userId,
				...addressData,
				isDefault: existingAddress ? false : true,
			},
		})
	}

	if (!finalAddress) {
		throw new BadRequestError('Address is required !')
	}

	// 3. Calculate totals
	let totalAmount = 0
	const orderItemsData = []

	for (const item of cart.items) {
		const price = item.variant
			? item.variant.price || item.variant.basePrice
			: item.product.price || item.product.basePrice

		if (!price) {
			throw new BadRequestError(`Price not found for product ${item.product.name} !`)
		}

		totalAmount += price * item.quantity

		orderItemsData.push({
			data: {
				name: item.product.name,
				sku: item.product.sku,
				quantity: item.quantity,
				price: price,
				image: item.product.images[0],
				variant: item.variant
					? {
							sku: item.variant.sku,
							options: item.variant.productVariantOptions.map((option) => ({
								attribute: option.option.attribute.name,
								option: option.option.name,
							})),
						}
					: null,
			},
		})
	}

	// 4. Calculate shipping cost (based on subtotal BEFORE discount)
	const shippingCost = calculateShippingCost(shippingOption, totalAmount)

	// 5. Apply coupon if provided (only on product subtotal, NOT on shipping)
	let discountAmount = 0
	let couponId: string | null = null

	if (coupon) {
		const foundCoupon = await prisma.coupons.findFirst({
			where: { code: coupon },
		})

		if (!foundCoupon) {
			throw new NotFoundError('Coupon not found !')
		}

		if (!foundCoupon.isActive) {
			throw new BadRequestError('Coupon is not active !')
		}

		if (foundCoupon.expiresAt && new Date(foundCoupon.expiresAt) < new Date()) {
			throw new BadRequestError('Coupon has expired !')
		}

		// Calculate discount on product subtotal only (NOT on shipping)
		if (foundCoupon.type === 'PERCENTAGE') {
			discountAmount = (totalAmount * foundCoupon.value) / 100
		} else {
			discountAmount = foundCoupon.value
		}

		// Ensure discount doesn't exceed product subtotal
		discountAmount = Math.min(discountAmount, totalAmount)
		couponId = foundCoupon.id
	}

	// Final total = (product subtotal - discount) + shipping cost
	// Shipping cost is NOT affected by coupon discount
	const finalTotal = totalAmount + shippingCost - discountAmount

	// 6. Create order
	const order = (await prisma.orders.create({
		data: {
			userId,
			addressId: finalAddress.id,
			couponId: couponId,
			orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			totalAmount: finalTotal,
			status: OrderStatus.PENDING,
			shippingCost: shippingCost,
			items: {
				create: orderItemsData,
			},
			payments: {
				create: {
					provider: payment.provider,
					amount: finalTotal,
					status: PaymentStatus.COMPLETED,
					transactionId: payment.transactionId,
					metadata: payment.metadata,
				},
			},
		},
		include: {
			items: true,
			payments: true,
			coupon: true,
		},
	})) as unknown as UserOrder

	// 7. Clear cart
	await cartService.clearCart(userId, undefined)

	return order
}

/**
 * Get user orders
 */
export const getAllOrders = async () => {
	return prisma.orders.findMany({
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			items: true,
			payments: true,
			coupon: true,
		},
		orderBy: { createdAt: 'desc' },
	}) as unknown as OrderDetails[]
}

export const getUserOrders = async (userId: string) => {
	return prisma.orders.findMany({
		where: { userId },
		include: {
			items: true,
			payments: true,
			coupon: true,
		},
		orderBy: { createdAt: 'desc' },
	}) as unknown as UserOrder[]
}

/**
 * Get order by ID
 */
export const getOrder = async (id: string, userId?: string) => {
	const order = (await prisma.orders.findUnique({
		where: { id },
		include: {
			items: true,
			payments: true,
			coupon: true,
		},
	})) as unknown as UserOrder

	if (!order) {
		throw new NotFoundError('Order not found !')
	}

	if (userId && order.userId !== userId) {
		throw new BadRequestError('Not authorized to view this order !')
	}

	return order
}

/**
 * Get order by order number
 */
export const getOrderByNumber = async (orderNumber: string, userId?: string) => {
	const order = (await prisma.orders.findUnique({
		where: { orderNumber },
		include: {
			items: true,
			payments: true,
			coupon: true,
		},
	})) as unknown as UserOrder

	if (!order) {
		throw new NotFoundError('Order not found !')
	}

	if (userId && order.userId !== userId) {
		throw new BadRequestError('Not authorized to view this order !')
	}

	return order
}

/**
 * Update order status (Admin)
 */
export const updateStatus = async (id: string, data: UpdateOrderStatusInput) => {
	const order = await prisma.orders.findUnique({ where: { id } })
	if (!order) throw new NotFoundError('Order not found !')

	return prisma.orders.update({
		where: { id },
		data: { status: data.status },
		include: {
			items: true,
			payments: true,
			coupon: true,
		},
	}) as unknown as UserOrder
}

/**
 * Cancel order
 */
export const cancelOrder = async (id: string, userId: string) => {
	const order = await prisma.orders.findUnique({ where: { id } })
	if (!order) throw new NotFoundError('Order not found !')

	if (order.userId !== userId) {
		throw new BadRequestError('Not authorized to cancel this order !')
	}

	if (order.status !== 'PENDING') {
		throw new BadRequestError('Cannot cancel order that is not pending !')
	}

	return prisma.orders.update({
		where: { id },
		data: { status: 'CANCELLED' },
		include: {
			items: true,
			payments: true,
			coupon: true,
		},
	}) as unknown as UserOrder
}
