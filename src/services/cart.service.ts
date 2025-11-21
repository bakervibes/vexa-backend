/**
 * Cart Service
 */

import {
	AddToCartInput,
	UpdateCartItemInput
} from '@/validators/cart.validator'
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
											attribute: true
										}
									}
								}
							}
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	})

	if (!cart) {
		// Create a new cart if it doesn't exist
		cart = await prisma.carts.create({
			data: {
				userId,
				sessionId
			},
			include: {
				items: {
					include: {
						product: true,
						variant: true
					}
				}
			}
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
	let cart = await getCart(userId, sessionId)

	// Check if product exists
	const product = await prisma.products.findUnique({
		where: { id: productId }
	})

	if (!product) {
		throw new NotFoundError('Product not found')
	}

	// Check if variant exists if provided
	if (variantId) {
		const variant = await prisma.product_variants.findUnique({
			where: { id: variantId }
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
			cartId_variantId: variantId ? { cartId: cart.id, variantId } : undefined // This might be tricky if unique constraint is on cartId, variantId.
			// If variantId is null, we need to check how to handle uniqueness for base product.
			// The schema says @@unique([cartId, variantId]). If variantId is nullable, this works for variants.
			// For products without variants, we might need to check differently or ensure variantId is handled.
			// Let's check schema again.
			// Schema: @@unique([cartId, variantId])
			// If variantId is null, Prisma treats it as unique combination of cartId + null.
		} as any // Type casting to bypass potential type issue if variantId is optional in where
	})

	// Actually, if variantId is optional, we should query carefully.
	// If variantId is provided, we check for that specific variant.
	// If variantId is NOT provided, we check for an item with this productId and NO variantId?
	// The schema unique constraint is on [cartId, variantId].
	// If we add a product without variant, variantId is null.
	// So we can search by cartId and variantId (which can be null).

	// However, we also have productId in cart_items.
	// If we add the same product twice without variant, it should update quantity.

	// Let's refine the search.
	const item = await prisma.cart_items.findFirst({
		where: {
			cartId: cart.id,
			productId: productId,
			variantId: variantId || null
		}
	})

	if (item) {
		// Update quantity
		await prisma.cart_items.update({
			where: { id: item.id },
			data: {
				quantity: item.quantity + quantity
			}
		})
	} else {
		// Create new item
		await prisma.cart_items.create({
			data: {
				cartId: cart.id,
				productId,
				variantId,
				quantity
			}
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
		where: { id: itemId }
	})

	if (!item || item.cartId !== cart.id) {
		throw new NotFoundError('Item not found in cart')
	}

	await prisma.cart_items.update({
		where: { id: itemId },
		data: { quantity }
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
		where: { id: itemId }
	})

	if (!item || item.cartId !== cart.id) {
		throw new NotFoundError('Item not found in cart')
	}

	await prisma.cart_items.delete({
		where: { id: itemId }
	})

	return getCart(userId, sessionId)
}

/**
 * Clear cart
 */
export const clearCart = async (
	userId: string | undefined,
	sessionId: string | undefined
) => {
	const cart = await getCart(userId, sessionId)

	await prisma.cart_items.deleteMany({
		where: { cartId: cart.id }
	})

	return { message: 'Cart cleared successfully' }
}
