import { z } from 'zod'

/**
 * Schéma de validation pour le filtrage des produits
 */
export const filterSchema = z.object({
	search: z.string().optional(),
	categories: z.array(z.string()).optional(),
	options: z.array(z.string()).optional(),
	minPrice: z.number().min(0).optional(),
	maxPrice: z.number().min(0).optional(),
	isActive: z.boolean().optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
	sortBy: z
		.enum(['name', 'price', 'createdAt', 'updatedAt'])
		.default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc')
})

/**
 * Schéma pour les options de variante
 */
const variantOptionSchema = z.object({
	optionId: z.cuid("ID d'option invalide")
})

/**
 * Schéma pour les variantes de produit
 */
const productVariantSchema = z.object({
	sku: z
		.string({ message: 'Le SKU est requis' })
		.min(1, 'Le SKU est requis')
		.max(100, 'Le SKU ne peut pas dépasser 100 caractères'),
	basePrice: z
		.number({ message: 'Le prix de base est requis' })
		.min(0, 'Le prix de base doit être positif'),
	price: z.number().min(0, 'Le prix doit être positif').optional(),
	stock: z
		.number({ message: 'Le stock est requis' })
		.int('Le stock doit être un nombre entier')
		.min(0, 'Le stock doit être positif')
		.default(0),
	isActive: z.boolean().optional().default(true),
	options: z.array(variantOptionSchema).optional()
})

/**
 * Schéma de validation pour la création d'un produit
 */
export const createProductSchema = z.object({
	categoryId: z.cuid('ID de catégorie invalide').optional(),
	name: z
		.string({ message: 'Le nom est requis' })
		.min(1, 'Le nom est requis')
		.max(255, 'Le nom ne peut pas dépasser 255 caractères')
		.trim(),
	slug: z
		.string({ message: 'Le slug est requis' })
		.min(1, 'Le slug est requis')
		.max(255, 'Le slug ne peut pas dépasser 255 caractères')
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Le slug doit être en minuscules et ne peut contenir que des lettres, chiffres et tirets'
		)
		.trim(),
	description: z.string().optional(),
	basePrice: z.number().min(0, 'Le prix de base doit être positif').optional(),
	price: z.number().min(0, 'Le prix doit être positif').optional(),
	images: z
		.array(z.string().url("URL d'image invalide"))
		.optional()
		.default([]),
	isActive: z.boolean().optional().default(true),
	metaTitle: z
		.string()
		.max(60, 'Le meta titre ne peut pas dépasser 60 caractères')
		.optional(),
	metaDescription: z
		.string()
		.max(160, 'La meta description ne peut pas dépasser 160 caractères')
		.optional(),
	variants: z.array(productVariantSchema).optional()
})

/**
 * Schéma de validation pour la mise à jour d'un produit
 */
export const updateProductSchema = z.object({
	categoryId: z.cuid('ID de catégorie invalide').optional(),
	name: z
		.string()
		.min(1, 'Le nom est requis')
		.max(255, 'Le nom ne peut pas dépasser 255 caractères')
		.trim()
		.optional(),
	slug: z
		.string()
		.min(1, 'Le slug est requis')
		.max(255, 'Le slug ne peut pas dépasser 255 caractères')
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Le slug doit être en minuscules et ne peut contenir que des lettres, chiffres et tirets'
		)
		.trim()
		.optional(),
	description: z.string().optional(),
	basePrice: z.number().min(0, 'Le prix de base doit être positif').optional(),
	price: z.number().min(0, 'Le prix doit être positif').optional(),
	images: z.array(z.string().url("URL d'image invalide")).optional(),
	isActive: z.boolean().optional(),
	metaTitle: z
		.string()
		.max(60, 'Le meta titre ne peut pas dépasser 60 caractères')
		.optional(),
	metaDescription: z
		.string()
		.max(160, 'La meta description ne peut pas dépasser 160 caractères')
		.optional(),
	variants: z.array(productVariantSchema).optional()
})

/**
 * Schéma de validation pour les paramètres de route
 */
export const productIdSchema = z.object({
	id: z.cuid('ID de produit invalide')
})

export const productSlugSchema = z.object({
	slug: z.string().min(1, 'Le slug est requis')
})

export const categorySlugSchema = z.object({
	categorySlug: z.string().min(1, 'Le slug de catégorie est requis')
})

// Types
export type FilterInput = z.infer<typeof filterSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
export type ProductSlugInput = z.infer<typeof productSlugSchema>
export type CategorySlugInput = z.infer<typeof categorySlugSchema>
