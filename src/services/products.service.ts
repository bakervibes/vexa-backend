/**
 * Service de produits
 */

import { SortBy, SortOrder } from '@/validators/common.schemas'
import type {
	CreateProductInput,
	FilterInput,
	UpdateProductInput,
} from '@/validators/products.validator'
import { faker } from '@faker-js/faker'
import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Récupérer tous les produits avec filtres
 */
export const getAll = async (filters?: Partial<FilterInput>) => {
	const search = filters?.search
	const categories = filters?.categories
	const options = filters?.options
	const minPrice = filters?.priceRange?.min
	const maxPrice = filters?.priceRange?.max
	const page = filters?.page ? Number(filters?.page) : 1
	const sortBy = filters?.sortBy
	const sortOrder = filters?.sortOrder

	const whereConditions: Prisma.productsWhereInput[] = []

	// Search filter
	if (search) {
		whereConditions.push({
			OR: [
				{
					name: {
						contains: search,
						mode: 'insensitive',
					},
				},
				{
					description: {
						contains: search,
						mode: 'insensitive',
					},
				},
			],
		})
	}

	// Categories filter
	if (categories && categories.length > 0) {
		whereConditions.push({
			category: {
				slug: {
					in: categories,
				},
			},
		})
	}

	// Options filter - filter by attribute name and option name
	// Format: [{attributeName: optionName}, ...]
	if (options && options.length > 0) {
		// Build OR conditions for each attribute-option pair
		const optionConditions = options.map((opt) => {
			const [attributeName, optionName] = Object.entries(opt)[0]
			return {
				variants: {
					some: {
						productVariantOptions: {
							some: {
								option: {
									name: optionName,
									attribute: {
										name: attributeName,
									},
								},
							},
						},
					},
				},
			}
		})

		// At least one option must match (OR logic)
		whereConditions.push({
			OR: optionConditions,
		})
	}

	// Price range filter
	if (minPrice || maxPrice) {
		whereConditions.push({
			OR: [
				{
					basePrice: { gte: minPrice, lte: maxPrice },
				},
				{
					price: { gte: minPrice, lte: maxPrice },
				},
				{
					variants: {
						some: {
							OR: [
								{
									basePrice: { gte: minPrice, lte: maxPrice },
								},
								{ price: { gte: minPrice, lte: maxPrice } },
							],
						},
					},
				},
			],
		})
	}

	// Pagination
	const skip = (page - 1) * 21
	const take = 21

	// Sorting
	let orderBy: Prisma.productsOrderByWithRelationInput

	// For price sorting, we need to handle it differently
	// We'll fetch products and sort them in-memory
	const needsManualPriceSort = sortBy === SortBy.PRICE

	if (sortBy && sortOrder && !needsManualPriceSort) {
		orderBy = {
			[sortBy]: sortOrder,
		}
	} else if (!needsManualPriceSort) {
		orderBy = {
			createdAt: 'desc',
		}
	} else {
		// Default order for manual sorting
		orderBy = {
			createdAt: 'desc',
		}
	}

	let products = []
	let total: number

	if (needsManualPriceSort) {
		// For price sorting, fetch all matching products without pagination
		const allProducts = await prisma.products.findMany({
			where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
			include: {
				category: true,
				variants: {
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
					orderBy: {
						createdAt: 'asc',
					},
				},
				reviews: {
					where: { isApproved: true },
					include: {
						user: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
			},
		})

		// Calculate effective price for each product
		const productsWithPrice = allProducts.map((product) => {
			let effectivePrice: number

			// Collect all possible prices
			const allPrices: number[] = []

			// Add product prices if available
			if (product.price !== null && product.price !== undefined) {
				allPrices.push(product.price)
			}
			if (product.basePrice !== null && product.basePrice !== undefined) {
				allPrices.push(product.basePrice)
			}

			// Add variant prices if available
			if (product.variants && product.variants.length > 0) {
				product.variants.forEach((variant) => {
					if (variant.price !== null && variant.price !== undefined) {
						allPrices.push(variant.price)
					}
					if (variant.basePrice !== null && variant.basePrice !== undefined) {
						allPrices.push(variant.basePrice)
					}
				})
			}

			// Determine effective price based on sort order
			if (allPrices.length > 0) {
				if (sortOrder === SortOrder.ASC) {
					// For ascending order, use the minimum price
					effectivePrice = Math.min(...allPrices)
				} else {
					// For descending order, use the maximum price
					effectivePrice = Math.max(...allPrices)
				}
			} else {
				effectivePrice = 0
			}

			return {
				...product,
				_effectivePrice: effectivePrice,
			}
		})

		// Sort by effective price
		productsWithPrice.sort((a, b) => {
			if (sortOrder === SortOrder.ASC) {
				return a._effectivePrice - b._effectivePrice
			} else {
				return b._effectivePrice - a._effectivePrice
			}
		})

		// Apply pagination after sorting
		total = productsWithPrice.length
		products = productsWithPrice.slice(skip, skip + take)
	} else {
		// Normal sorting with pagination
		;[products, total] = await Promise.all([
			prisma.products.findMany({
				where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				include: {
					category: true,
					variants: {
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
						orderBy: {
							createdAt: 'asc',
						},
					},
					reviews: {
						where: { isApproved: true },
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
				},
				skip,
				take,
				orderBy,
			}),
			prisma.products.count({
				where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
			}),
		])
	}

	// Calculate average rating for each product
	const productsWithRating = products.map((product) => {
		const avgRating =
			product.reviews.length > 0
				? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
				: 0

		return {
			...product,
			averageRating: Math.round(avgRating * 10) / 10,
			reviewCount: product.reviews.length,
		}
	})

	return {
		products: productsWithRating,
		pagination: {
			page,
			total,
			totalPages: Math.ceil(total / 21),
		},
	}
}

/**
 * Récupérer un produit par slug
 */
export const getOne = async (slug: string) => {
	const product = await prisma.products.findUnique({
		where: { slug },
		include: {
			category: true,
			variants: {
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
				orderBy: {
					createdAt: 'asc',
				},
			},
			reviews: {
				where: { isApproved: true },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			},
		},
	})

	if (!product) {
		throw new NotFoundError('Produit non trouvé !')
	}

	// Calculate average rating
	const avgRating =
		product.reviews.length > 0
			? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
			: 0

	return {
		...product,
		averageRating: Math.round(avgRating * 10) / 10,
		reviewCount: product.reviews.length,
	}
}

/**
 * Récupérer un produit par ID
 */
export const getById = async (id: string) => {
	const product = await prisma.products.findUnique({
		where: { id },
		include: {
			category: true,
			variants: {
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
				orderBy: {
					createdAt: 'asc',
				},
			},
			reviews: {
				where: { isApproved: true },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			},
		},
	})

	if (!product) {
		throw new NotFoundError('Produit non trouvé !')
	}

	return product
}

/**
 * Créer un nouveau produit
 */
export const create = async (data: CreateProductInput) => {
	const { categoryId, variants, ...productData } = data

	// Vérifier que la catégorie existe
	if (categoryId) {
		const category = await prisma.categories.findUnique({
			where: { id: categoryId },
		})

		if (!category) {
			throw new NotFoundError('Catégorie non trouvée !')
		}
	}

	// Vérifier que le slug n'existe pas déjà
	const existingProduct = await prisma.products.findUnique({
		where: { slug: productData.slug },
	})

	if (existingProduct) {
		throw new BadRequestError('Un produit avec ce slug existe déjà !')
	}

	// Créer le produit avec ses variantes
	const product = await prisma.products.create({
		data: {
			...productData,
			categoryId,
			sku: faker.commerce.isbn(),
			stock: variants?.reduce((acc, variant) => acc + variant.stock, 0) || 0,
			isActive: true,
			variants: variants
				? {
						create: variants.map((variant) => ({
							sku: variant.sku,
							basePrice: variant.basePrice,
							price: variant.price,
							stock: variant.stock,
							isActive: true,
							productVariantOptions: variant.options
								? {
										create: variant.options.map((option) => ({
											optionId: option.optionId,
											productId: '', // Will be set by Prisma
										})),
									}
								: undefined,
						})),
					}
				: undefined,
		},
		include: {
			category: true,
			variants: {
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
	})

	return product
}

/**
 * Mettre à jour un produit
 */
export const update = async (id: string, data: UpdateProductInput) => {
	const { categoryId, variants: _variants, ...productData } = data

	// Vérifier que le produit existe
	const existingProduct = await prisma.products.findUnique({
		where: { id },
	})

	if (!existingProduct) {
		throw new NotFoundError('Produit non trouvé !')
	}

	// Vérifier que la catégorie existe si fournie
	if (categoryId) {
		const category = await prisma.categories.findUnique({
			where: { id: categoryId },
		})

		if (!category) {
			throw new NotFoundError('Catégorie non trouvée !')
		}
	}

	// Vérifier que le slug n'est pas déjà utilisé par un autre produit
	if (productData.slug && productData.slug !== existingProduct.slug) {
		const slugExists = await prisma.products.findUnique({
			where: { slug: productData.slug },
		})

		if (slugExists) {
			throw new BadRequestError('Un produit avec ce slug existe déjà !')
		}
	}

	// Mettre à jour le produit
	const product = await prisma.products.update({
		where: { id },
		data: {
			...productData,
			categoryId,
		},
		include: {
			category: true,
			variants: {
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
	})

	return product
}

/**
 * Supprimer un produit
 */
export const remove = async (id: string) => {
	// Vérifier que le produit existe
	const existingProduct = await prisma.products.findUnique({
		where: { id },
	})

	if (!existingProduct) {
		throw new NotFoundError('Produit non trouvé !')
	}

	// Supprimer le produit (cascade delete pour les variantes et options)
	await prisma.products.delete({
		where: { id },
	})

	return { message: 'Produit supprimé avec succès !' }
}

/**
 * Récupérer les produits par catégorie
 */
export const getByCategory = async (categorySlug: string, query?: FilterInput) => {
	const category = await prisma.categories.findUnique({
		where: { slug: categorySlug },
	})

	if (!category) {
		throw new NotFoundError('Catégorie non trouvée !')
	}

	// Utiliser la fonction getAll avec le filtre de catégorie
	const mergedQuery = {
		...(query || {}),
		categories: [categorySlug],
	}
	return getAll(mergedQuery)
}

/**
 * Récupérer les produits en vedette (featured)
 * Pour l'instant, on retourne les produits les plus récents et actifs
 */
export const getFeatured = async () => {
	const products = await prisma.products.findMany({
		where: {
			isActive: true,
		},
		include: productInclude,
		orderBy: {
			createdAt: 'desc',
		},
		take: 12,
	})

	return addRatingToProducts(products)
}

/**
 * Helper to include product with full details
 */
const productInclude = {
	category: true,
	variants: {
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
	reviews: {
		where: { isApproved: true },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	},
}

/**
 * Helper to calculate average rating for products
 */
const addRatingToProducts = <T extends { reviews: { rating: number }[] }>(products: T[]) => {
	return products.map((product) => {
		const avgRating =
			product.reviews.length > 0
				? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
				: 0

		return {
			...product,
			averageRating: Math.round(avgRating * 10) / 10,
			reviewCount: product.reviews.length,
		}
	})
}

/**
 * Récupérer les produits similaires
 * Priority: 1) Same category, 2) Frequently bought together, 3) Random products
 * Target: 8 products
 */
export const getRelated = async (slug: string) => {
	const TARGET_COUNT = 8

	const product = await prisma.products.findUnique({
		where: { slug },
		select: {
			id: true,
			categoryId: true,
		},
	})

	if (!product) {
		throw new NotFoundError('Produit non trouvé !')
	}

	const collectedIds = new Set<string>([product.id])

	// Type for products with full includes
	type ProductWithIncludes = Awaited<
		ReturnType<
			typeof prisma.products.findMany<{
				include: typeof productInclude
			}>
		>
	>[number]

	const relatedProducts: ProductWithIncludes[] = []

	// 1) Products from the same category
	if (product.categoryId) {
		const categoryProducts = await prisma.products.findMany({
			where: {
				categoryId: product.categoryId,
				id: { notIn: Array.from(collectedIds) },
				isActive: true,
			},
			include: productInclude,
			take: TARGET_COUNT,
			orderBy: { createdAt: 'desc' },
		})

		for (const p of categoryProducts) {
			if (relatedProducts.length >= TARGET_COUNT) break
			collectedIds.add(p.id)
			relatedProducts.push(p)
		}
	}

	// 2) Frequently bought together (products found in the same orders)
	if (relatedProducts.length < TARGET_COUNT) {
		// Find orders that contain the current product
		const ordersWithProduct = await prisma.order_items.findMany({
			where: {
				data: {
					path: ['productId'],
					equals: product.id,
				},
			},
			select: { orderId: true },
		})

		if (ordersWithProduct.length > 0) {
			const orderIds = ordersWithProduct.map((o) => o.orderId)

			// Find other products in those orders
			const frequentlyBoughtItems = await prisma.order_items.findMany({
				where: {
					orderId: { in: orderIds },
					NOT: {
						data: {
							path: ['productId'],
							equals: product.id,
						},
					},
				},
				select: { data: true },
			})

			// Count occurrences of each product
			const productCounts = new Map<string, number>()
			for (const item of frequentlyBoughtItems) {
				const itemData = item.data as { productId?: string }
				const productId = itemData?.productId
				if (productId && !collectedIds.has(productId)) {
					productCounts.set(productId, (productCounts.get(productId) || 0) + 1)
				}
			}

			// Sort by frequency and get top products
			const sortedProductIds = Array.from(productCounts.entries())
				.sort((a, b) => b[1] - a[1])
				.map(([id]) => id)
				.slice(0, TARGET_COUNT - relatedProducts.length)

			if (sortedProductIds.length > 0) {
				const frequentProducts = await prisma.products.findMany({
					where: {
						id: { in: sortedProductIds },
						isActive: true,
					},
					include: productInclude,
				})

				for (const p of frequentProducts) {
					if (relatedProducts.length >= TARGET_COUNT) break
					collectedIds.add(p.id)
					relatedProducts.push(p)
				}
			}
		}
	}

	// 3) Fill with random products if needed
	if (relatedProducts.length < TARGET_COUNT) {
		const remaining = TARGET_COUNT - relatedProducts.length

		const randomProducts = await prisma.products.findMany({
			where: {
				id: { notIn: Array.from(collectedIds) },
				isActive: true,
			},
			include: productInclude,
			take: remaining,
			orderBy: { createdAt: 'desc' },
		})

		for (const p of randomProducts) {
			if (relatedProducts.length >= TARGET_COUNT) break
			collectedIds.add(p.id)
			relatedProducts.push(p)
		}
	}

	return addRatingToProducts(relatedProducts)
}

/**
 * Récupérer le produit le plus récent en promotion
 */
export const getRecentDiscount = async () => {
	const product = await prisma.products.findFirst({
		where: {
			isActive: true,
			expiresAt: {
				gt: new Date(),
			},
		},
		orderBy: {
			expiresAt: 'desc',
		},
	})

	return product
}
