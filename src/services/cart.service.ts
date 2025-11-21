/**
 * Cart Service
 */

import type { AddToCartInput, UpdateCartItemInput } from '@/validators/cart.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Get cart by user ID or session ID
 */
export const getCart = async (userId?: string, sessionId?: string) => {
	if (!userId && !sessionId) {
		throw new BadRequestError('User ID or Session ID is required')
	}

	const where = userId ? { userId } : { sessionId }

	let cart = await prisma.carts.findFirst({
		where,
		include: {
			items: {
				include: {
					product: true,
					variant: {
						include: {
							productVariantOptions: {
								include: {
									option: {
										include: {
											attribute: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			},
		},
	})

	if (!cart) {
		// Create a new cart if it doesn't exist
		cart = await prisma.carts.create({
			data: {
				userId,
				sessionId,
			},
			include: {
				items: {
					include: {
						product: true,
						variant: true,
					},
				},
			},
		})
	}

	return cart
}

/**
 * Add item to cart
 */
export const addItem = async (
	userId: string | undefined,
	sessionId: string | undefined,
	data: AddToCartInput
) => {
	const { productId, variantId, quantity } = data

	// Get or create cart
	const cart = await getCart(userId, sessionId)

	// Check if product exists
	const product = await prisma.products.findUnique({
		where: { id: productId },
	})

	if (!product) {
		throw new NotFoundError('Product not found')
	}

	// Check if variant exists if provided
	if (variantId) {
		const variant = await prisma.product_variants.findUnique({
			where: { id: variantId },
		})

		if (!variant) {
			throw new NotFoundError('Variant not found')
		}

		if (variant.productId !== productId) {
			throw new BadRequestError('Variant does not belong to this product')
		}
	}

	// Check if item already exists in cart
	await prisma.cart_items.findUnique({
		where: {
			cartId_variantId: variantId ? { cartId: cart.id, variantId } : undefined,
		},
	})

	const item = await prisma.cart_items.findFirst({
		where: {
			cartId: cart.id,
			productId: productId,
			variantId: variantId || null,
		},
	})

	if (item) {
		// Update quantity
		await prisma.cart_items.update({
			where: { id: item.id },
			data: {
				quantity: item.quantity + quantity,
			},
		})
	} else {
		// Create new item
		await prisma.cart_items.create({
			data: {
				cartId: cart.id,
				productId,
				variantId,
				quantity,
			},
		})
	}

	return getCart(userId, sessionId)
}

/**
 * Update cart item quantity
 */
export const updateItem = async (
	userId: string | undefined,
	sessionId: string | undefined,
	itemId: string,
	data: UpdateCartItemInput
) => {
	const { quantity } = data

	const cart = await getCart(userId, sessionId)

	const item = await prisma.cart_items.findUnique({
		where: { id: itemId },
	})

	if (!item || item.cartId !== cart.id) {
		throw new NotFoundError('Item not found in cart')
	}

	await prisma.cart_items.update({
		where: { id: itemId },
		data: { quantity },
	})

	return getCart(userId, sessionId)
}

/**
 * Remove item from cart
 */
export const removeItem = async (
	userId: string | undefined,
	sessionId: string | undefined,
	itemId: string
) => {
	const cart = await getCart(userId, sessionId)

	const item = await prisma.cart_items.findUnique({
		where: { id: itemId },
	})

	if (!item || item.cartId !== cart.id) {
		throw new NotFoundError('Item not found in cart')
	}

	await prisma.cart_items.delete({
		where: { id: itemId },
	})

	return getCart(userId, sessionId)
}

/**
 * Clear cart
 */
export const clearCart = async (userId: string | undefined, sessionId: string | undefined) => {
	const cart = await getCart(userId, sessionId)

	await prisma.cart_items.deleteMany({
		where: { cartId: cart.id },
	})

	return { message: 'Cart cleared successfully' }
}
