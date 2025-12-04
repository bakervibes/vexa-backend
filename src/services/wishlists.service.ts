/**
 * Wishlist Service
 */

import type { AddToWishlistInput, RemoveWishlistItemInput } from '@/validators/wishlists.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Get wishlist by user ID or session ID
 */
export const getWishlist = async (userId?: string, sessionId?: string) => {
	if (!userId && !sessionId) {
		throw new BadRequestError('User ID or session ID is required !')
	}

	let wishlist = await prisma.wishlists.findFirst({
		where: userId ? { userId } : sessionId ? { sessionId } : undefined,
		include: {
			items: {
				include: {
					product: { include: { variants: true } },
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

	if (!wishlist) {
		wishlist = await prisma.wishlists.create({
			data: {
				userId,
				sessionId,
			},
			include: {
				items: {
					include: {
						product: { include: { variants: true } },
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
	}

	return wishlist
}

/**
 * Add item to wishlist
 */
export const addToWishlist = async (
	userId: string | undefined,
	sessionId: string | undefined,
	data: AddToWishlistInput
) => {
	const { productId, variantId } = data

	// Get or create wishlist
	const wishlist = await getWishlist(userId, sessionId)

	// Check if product exists
	const product = await prisma.products.findUnique({
		where: {
			id: productId,
			...(variantId && { variants: { some: { id: variantId } } }),
		},
	})

	if (!product) {
		throw new NotFoundError('Product not found !')
	}

	// Check if item already exists in wishlist
	const item = await prisma.wishlist_items.findFirst({
		where: {
			wishlistId: wishlist.id,
			productId,
			...(variantId && { variantId }),
		},
	})

	if (item) {
		return getWishlist(userId, sessionId)
	}

	await prisma.wishlist_items.create({
		data: {
			wishlistId: wishlist.id,
			productId,
			variantId,
		},
	})

	return getWishlist(userId, sessionId)
}

/**
 * Remove item from wishlist
 */
export const removeWishlistItem = async (
	userId: string | undefined,
	sessionId: string | undefined,
	data: RemoveWishlistItemInput
) => {
	const { productId, variantId } = data

	const wishlist = await getWishlist(userId, sessionId)

	const item = await prisma.wishlist_items.findFirst({
		where: {
			wishlistId: wishlist.id,
			productId,
			...(variantId && { variantId }),
		},
	})

	if (!item) {
		return getWishlist(userId, sessionId)
	}

	await prisma.wishlist_items.delete({
		where: { id: item.id },
	})

	return getWishlist(userId, sessionId)
}

/**
 * Clear wishlist
 */
export const clearWishlist = async (userId: string | undefined, sessionId: string | undefined) => {
	const wishlist = await getWishlist(userId, sessionId)

	await prisma.wishlist_items.deleteMany({
		where: { wishlistId: wishlist.id },
	})

	return getWishlist(userId, sessionId)
}

/**
 * Merge guest wishlist into user wishlist
 */
export const mergeWishlists = async (userId: string, sessionId: string) => {
	// Find guest wishlist
	const guestWishlist = await prisma.wishlists.findFirst({
		where: { sessionId },
		include: { items: true },
	})

	// Find user wishlist
	const userWishlist = await prisma.wishlists.findFirst({
		where: { userId },
		include: { items: true },
	})

	// If neither wishlist exists, create a new one with both userId and sessionId
	if (!guestWishlist && !userWishlist) {
		await prisma.wishlists.create({
			data: {
				userId,
				sessionId,
			},
		})
		return getWishlist(userId, sessionId)
	}

	// If only guest wishlist exists, update it with userId
	if (guestWishlist && !userWishlist) {
		await prisma.wishlists.update({
			where: { id: guestWishlist.id },
			data: {
				userId,
				sessionId,
			},
		})
		return getWishlist(userId, sessionId)
	}

	// If only user wishlist exists, update it with sessionId
	if (!guestWishlist && userWishlist) {
		await prisma.wishlists.update({
			where: { id: userWishlist.id },
			data: {
				userId,
				sessionId,
			},
		})
		return getWishlist(userId, sessionId)
	}

	// If both exist, merge items into user wishlist and delete guest wishlist
	if (guestWishlist && userWishlist) {
		for (const item of guestWishlist.items) {
			const existingItem = userWishlist.items.find(
				(i) => i.productId === item.productId && i.variantId === item.variantId
			)

			if (existingItem) {
				continue
			}

			await prisma.wishlist_items.create({
				data: {
					wishlistId: userWishlist.id,
					productId: item.productId,
					variantId: item.variantId,
				},
			})
		}

		// Update user wishlist with sessionId
		await prisma.wishlists.update({
			where: { id: userWishlist.id },
			data: {
				userId,
				sessionId,
			},
		})

		// Delete the guest wishlist
		await prisma.wishlists.delete({
			where: { id: guestWishlist.id },
		})
	}

	return getWishlist(userId, sessionId)
}
