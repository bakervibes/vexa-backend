/**
 * Cart Service
 */
import type {
	AddToCartInput,
	RemoveCartItemInput,
	UpdateCartItemInput,
} from '@/validators/carts.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Get cart by user ID or session ID
 */
export const getCart = async (userId?: string, sessionId?: string) => {
	if (!userId && !sessionId) {
		throw new BadRequestError('User ID or session ID is required !')
	}

	const where = userId ? { userId } : sessionId ? { sessionId } : undefined

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
		cart = await prisma.carts.create({
			data: {
				userId,
				sessionId,
			},
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
				},
			},
		})
	}

	return cart
}

/**
 * Add item to cart
 */
export const addToCart = async (
	userId: string | undefined,
	sessionId: string | undefined,
	data: AddToCartInput
) => {
	const { productId, variantId, quantity } = data

	// Get or create cart
	const cart = await getCart(userId, sessionId)

	// Check if product exists and has enough stock
	const product = await prisma.products.findUnique({
		where: { id: productId },
		include: {
			variants: variantId ? { where: { id: variantId } } : false,
		},
	})

	if (!product) {
		throw new NotFoundError('Product not found !')
	}

	// Check stock availability
	if (variantId) {
		const variant = product.variants?.[0]
		if (!variant) {
			throw new NotFoundError('Variant not found !')
		}
		if (variant.stock < quantity) {
			throw new BadRequestError('Insufficient stock for this variant !')
		}
		if (product.stock < quantity) {
			throw new BadRequestError('Insufficient stock for this product !')
		}
	} else {
		if (product.stock < quantity) {
			throw new BadRequestError('Insufficient stock !')
		}
	}

	// Check if item already exists in cart
	const item = await prisma.cart_items.findFirst({
		where: { cartId: cart.id, productId, variantId },
	})

	if (item) {
		if (variantId) {
			const variant = product.variants?.[0]
			if (variant && (variant.stock < quantity || product.stock < quantity)) {
				throw new BadRequestError('Insufficient stock for requested quantity !')
			}
		} else {
			if (product.stock < quantity) {
				throw new BadRequestError('Insufficient stock for requested quantity !')
			}
		}

		await prisma.cart_items.update({
			where: { id: item.id },
			data: {
				quantity: { increment: quantity },
			},
		})
	} else {
		await prisma.cart_items.create({
			data: {
				cartId: cart.id,
				productId,
				variantId,
				quantity,
			},
		})
	}

	// Decrease stock
	if (variantId) {
		await prisma.product_variants.update({
			where: { id: variantId },
			data: { stock: { decrement: quantity } },
		})
	}

	await prisma.products.update({
		where: { id: productId },
		data: { stock: { decrement: quantity } },
	})

	return getCart(userId, sessionId)
}

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
	userId: string | undefined,
	sessionId: string | undefined,
	data: UpdateCartItemInput
) => {
	const { productId, variantId, quantity } = data

	const cart = await getCart(userId, sessionId)

	const item = await prisma.cart_items.findFirst({
		where: {
			cartId: cart.id,
			productId,
			...(variantId && { variantId }),
		},
	})

	if (!item) {
		throw new NotFoundError('Item not found in cart !')
	}

	// Check product and variant stock
	const product = await prisma.products.findUnique({
		where: { id: productId },
		include: {
			variants: variantId ? { where: { id: variantId } } : false,
		},
	})

	if (!product) {
		throw new NotFoundError('Product not found !')
	}

	const quantityDifference = quantity - item.quantity

	if (quantityDifference > 0) {
		// Increasing quantity - check stock and decrease
		if (variantId) {
			const variant = product.variants?.[0]
			if (!variant) {
				throw new NotFoundError('Variant not found !')
			}
			if (variant.stock < quantityDifference || product.stock < quantityDifference) {
				throw new BadRequestError('Insufficient stock !')
			}

			await prisma.product_variants.update({
				where: { id: variantId },
				data: { stock: { decrement: quantityDifference } },
			})
		} else {
			if (product.stock < quantityDifference) {
				throw new BadRequestError('Insufficient stock !')
			}
		}

		await prisma.products.update({
			where: { id: productId },
			data: { stock: { decrement: quantityDifference } },
		})
	} else if (quantityDifference < 0) {
		// Decreasing quantity - restore stock
		const restoreQuantity = Math.abs(quantityDifference)

		if (variantId) {
			await prisma.product_variants.update({
				where: { id: variantId },
				data: { stock: { increment: restoreQuantity } },
			})
		}

		await prisma.products.update({
			where: { id: productId },
			data: { stock: { increment: restoreQuantity } },
		})
	}

	await prisma.cart_items.update({
		where: { id: item.id },
		data: { quantity },
	})

	return getCart(userId, sessionId)
}

/**
 * Remove item from cart
 */
export const removeCartItem = async (
	userId: string | undefined,
	sessionId: string | undefined,
	data: RemoveCartItemInput
) => {
	const { productId, variantId } = data

	const cart = await getCart(userId, sessionId)

	const item = await prisma.cart_items.findFirst({
		where: {
			cartId: cart.id,
			productId,
			...(variantId && { variantId }),
		},
	})

	if (!item) {
		throw new NotFoundError('Item not found in cart !')
	}

	// Restore stock when removing item
	if (variantId) {
		await prisma.product_variants.update({
			where: { id: variantId },
			data: { stock: { increment: item.quantity } },
		})
	}

	await prisma.products.update({
		where: { id: productId },
		data: { stock: { increment: item.quantity } },
	})

	await prisma.cart_items.delete({
		where: { id: item.id },
	})

	return getCart(userId, sessionId)
}

/**
 * Clear cart
 */
export const clearCart = async (userId: string | undefined, sessionId: string | undefined) => {
	const cart = await getCart(userId, sessionId)

	// Restore stock for all items before clearing
	const items = await prisma.cart_items.findMany({
		where: { cartId: cart.id },
	})

	for (const item of items) {
		if (item.variantId) {
			await prisma.product_variants.update({
				where: { id: item.variantId },
				data: { stock: { increment: item.quantity } },
			})
		}

		await prisma.products.update({
			where: { id: item.productId },
			data: { stock: { increment: item.quantity } },
		})
	}

	await prisma.cart_items.deleteMany({
		where: { cartId: cart.id },
	})

	return getCart(userId, sessionId)
}

/**
 * Merge guest cart into user cart
 */
export const mergeCarts = async (userId: string, sessionId: string) => {
	// Find guest cart
	const guestCart = await prisma.carts.findFirst({
		where: { sessionId },
		include: { items: true },
	})

	// Find user cart
	const userCart = await prisma.carts.findFirst({
		where: { userId },
		include: { items: true },
	})

	// If neither cart exists, create a new one with both userId and sessionId
	if (!guestCart && !userCart) {
		await prisma.carts.create({
			data: {
				userId,
				sessionId,
			},
		})
		return getCart(userId, sessionId)
	}

	// If only guest cart exists, update it with userId
	if (guestCart && !userCart) {
		await prisma.carts.update({
			where: { id: guestCart.id },
			data: {
				userId,
				sessionId,
			},
		})
		return getCart(userId, sessionId)
	}

	// If only user cart exists, update it with sessionId
	if (!guestCart && userCart) {
		await prisma.carts.update({
			where: { id: userCart.id },
			data: {
				userId,
				sessionId,
			},
		})
		return getCart(userId, sessionId)
	}

	// If both exist, merge items into user cart and delete guest cart
	if (guestCart && userCart) {
		// If they are the same cart, do nothing
		if (guestCart.id === userCart.id) {
			return getCart(userId, sessionId)
		}

		for (const item of guestCart.items) {
			const existingItem = userCart.items.find(
				(i) => i.productId === item.productId && i.variantId === item.variantId
			)

			if (existingItem) {
				// Update quantity in user cart
				await prisma.cart_items.update({
					where: { id: existingItem.id },
					data: { quantity: existingItem.quantity + item.quantity },
				})
			} else {
				// Move item to user cart
				await prisma.cart_items.update({
					where: { id: item.id },
					data: { cartId: userCart.id },
				})
			}
		}

		// Delete the guest cart first to free up the sessionId
		await prisma.carts.delete({
			where: { id: guestCart.id },
		})

		// Update user cart with sessionId
		await prisma.carts.update({
			where: { id: userCart.id },
			data: {
				userId,
				sessionId,
			},
		})
	}

	return getCart(userId, sessionId)
}
