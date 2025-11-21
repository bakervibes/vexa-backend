/**
 * Service de produits
 */

import {
	CreateProductInput,
	FilterInput,
	UpdateProductInput
} from '@/validators/products.validator'
import { Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Récupérer tous les produits avec filtres
 */
export const getAll = async (query?: Partial<FilterInput>) => {
	const {
		search,
		categories,
		options,
		minPrice,
		maxPrice,
		isActive,
		page = 1,
		limit = 20,
		sortBy = 'createdAt',
		sortOrder = 'desc'
	} = query || {}

	const whereConditions: Prisma.productsWhereInput[] = []

	// Search filter
	if (search) {
		whereConditions.push({
			OR: [
				{
					name: {
						contains: search,
						mode: 'insensitive'
					}
				},
				{
					description: {
						contains: search,
						mode: 'insensitive'
					}
				}
			]
		})
	}

	// Categories filter
	if (categories && categories.length > 0) {
		whereConditions.push({
			category: {
				slug: {
					in: categories
				}
			}
		})
	}

	// Options filter
	if (options && options.length > 0) {
		whereConditions.push({
			variants: {
				some: {
					productVariantOptions: {
						some: {
							optionId: {
								in: options
							}
						}
					}
				}
			}
		})
	}

	// Price range filter
	if (minPrice !== undefined || maxPrice !== undefined) {
		const priceFilter: any = {}
		if (minPrice !== undefined) priceFilter.gte = minPrice
		if (maxPrice !== undefined) priceFilter.lte = maxPrice

		whereConditions.push({
			price: priceFilter
		})
	}

	// Active status filter
	if (isActive !== undefined) {
		whereConditions.push({
			isActive
		})
	}

	// Pagination
	const skip = (page - 1) * limit
	const take = limit

	// Sorting
	const orderBy: Prisma.productsOrderByWithRelationInput = {
		[sortBy]: sortOrder
	}

	const [products, total] = await Promise.all([
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
										attribute: true
									}
								}
							}
						}
					}
				},
				reviews: {
					where: { isApproved: true },
					select: {
						rating: true
					}
				}
			},
			skip,
			take,
			orderBy
		}),
		prisma.products.count({
			where: whereConditions.length > 0 ? { AND: whereConditions } : undefined
		})
	])

	// Calculate average rating for each product
	const productsWithRating = products.map((product) => {
		const avgRating =
			product.reviews.length > 0
				? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
				  product.reviews.length
				: 0

		return {
			...product,
			averageRating: Math.round(avgRating * 10) / 10,
			reviewCount: product.reviews.length
		}
	})

	return {
		products: productsWithRating,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		}
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
									attribute: true
								}
							}
						}
					}
				}
			},
			reviews: {
				where: { isApproved: true },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	})

	if (!product) {
		throw new NotFoundError('Produit non trouvé')
	}

	// Calculate average rating
	const avgRating =
		product.reviews.length > 0
			? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
			  product.reviews.length
			: 0

	return {
		...product,
		averageRating: Math.round(avgRating * 10) / 10,
		reviewCount: product.reviews.length
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
									attribute: true
								}
							}
						}
					}
				}
			}
		}
	})

	if (!product) {
		throw new NotFoundError('Produit non trouvé')
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
			where: { id: categoryId }
		})

		if (!category) {
			throw new NotFoundError('Catégorie non trouvée')
		}
	}

	// Vérifier que le slug n'existe pas déjà
	const existingProduct = await prisma.products.findUnique({
		where: { slug: productData.slug }
	})

	if (existingProduct) {
		throw new BadRequestError('Un produit avec ce slug existe déjà')
	}

	// Créer le produit avec ses variantes
	const product = await prisma.products.create({
		data: {
			...productData,
			categoryId,
			variants: variants
				? {
						create: variants.map((variant) => ({
							sku: variant.sku,
							basePrice: variant.basePrice,
							price: variant.price,
							stock: variant.stock,
							isActive: variant.isActive ?? true,
							productVariantOptions: variant.options
								? {
										create: variant.options.map((option) => ({
											optionId: option.optionId,
											productId: '' // Will be set by Prisma
										}))
								  }
								: undefined
						}))
				  }
				: undefined
		},
		include: {
			category: true,
			variants: {
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
		}
	})

	return product
}

/**
 * Mettre à jour un produit
 */
export const update = async (id: string, data: UpdateProductInput) => {
	const { categoryId, variants, ...productData } = data

	// Vérifier que le produit existe
	const existingProduct = await prisma.products.findUnique({
		where: { id }
	})

	if (!existingProduct) {
		throw new NotFoundError('Produit non trouvé')
	}

	// Vérifier que la catégorie existe si fournie
	if (categoryId) {
		const category = await prisma.categories.findUnique({
			where: { id: categoryId }
		})

		if (!category) {
			throw new NotFoundError('Catégorie non trouvée')
		}
	}

	// Vérifier que le slug n'est pas déjà utilisé par un autre produit
	if (productData.slug && productData.slug !== existingProduct.slug) {
		const slugExists = await prisma.products.findUnique({
			where: { slug: productData.slug }
		})

		if (slugExists) {
			throw new BadRequestError('Un produit avec ce slug existe déjà')
		}
	}

	// Mettre à jour le produit
	const product = await prisma.products.update({
		where: { id },
		data: {
			...productData,
			categoryId
		},
		include: {
			category: true,
			variants: {
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
		}
	})

	return product
}

/**
 * Supprimer un produit
 */
export const remove = async (id: string) => {
	// Vérifier que le produit existe
	const existingProduct = await prisma.products.findUnique({
		where: { id }
	})

	if (!existingProduct) {
		throw new NotFoundError('Produit non trouvé')
	}

	// Supprimer le produit (cascade delete pour les variantes et options)
	await prisma.products.delete({
		where: { id }
	})

	return { message: 'Produit supprimé avec succès' }
}

/**
 * Récupérer les produits par catégorie
 */
export const getByCategory = async (
	categorySlug: string,
	query?: FilterInput
) => {
	const category = await prisma.categories.findUnique({
		where: { slug: categorySlug }
	})

	if (!category) {
		throw new NotFoundError('Catégorie non trouvée')
	}

	// Utiliser la fonction getAll avec le filtre de catégorie
	const mergedQuery = {
		...(query || {}),
		categories: [categorySlug]
	}
	return getAll(mergedQuery)
}

/**
 * Récupérer les produits en vedette (featured)
 * Pour l'instant, on retourne les produits les plus récents et actifs
 */
export const getFeatured = async (limit: number = 8) => {
	const products = await prisma.products.findMany({
		where: {
			isActive: true
		},
		include: {
			category: true,
			variants: {
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
			},
			reviews: {
				where: { isApproved: true },
				select: {
					rating: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: limit
	})

	// Calculate average rating for each product
	const productsWithRating = products.map((product) => {
		const avgRating =
			product.reviews.length > 0
				? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
				  product.reviews.length
				: 0

		return {
			...product,
			averageRating: Math.round(avgRating * 10) / 10,
			reviewCount: product.reviews.length
		}
	})

	return productsWithRating
}

/**
 * Récupérer les produits similaires
 */
export const getRelated = async (productId: string, limit: number = 4) => {
	const product = await prisma.products.findUnique({
		where: { id: productId },
		select: {
			categoryId: true
		}
	})

	if (!product) {
		throw new NotFoundError('Produit non trouvé')
	}

	const relatedProducts = await prisma.products.findMany({
		where: {
			categoryId: product.categoryId,
			id: {
				not: productId
			},
			isActive: true
		},
		include: {
			category: true,
			variants: {
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
			},
			reviews: {
				where: { isApproved: true },
				select: {
					rating: true
				}
			}
		},
		take: limit,
		orderBy: {
			createdAt: 'desc'
		}
	})

	// Calculate average rating for each product
	const productsWithRating = relatedProducts.map((product) => {
		const avgRating =
			product.reviews.length > 0
				? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
				  product.reviews.length
				: 0

		return {
			...product,
			averageRating: Math.round(avgRating * 10) / 10,
			reviewCount: product.reviews.length
		}
	})

	return productsWithRating
}
