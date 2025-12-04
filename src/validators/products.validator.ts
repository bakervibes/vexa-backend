import { z } from 'zod'
import {
	categoriesFilterSchema,
	cuidSchema,
	descriptionSchema,
	imagesSchema,
	limitSchema,
	metaDescriptionSchema,
	metaTitleSchema,
	nameLongSchema,
	optionsFilterSchema,
	pageSchema,
	priceRangeFilterSchema,
	priceSchema,
	searchSchema,
	skuSchema,
	slugSchema,
	sortBySchema,
	sortOrderSchema,
	stockSchema,
} from './common.schemas'

/**
 * Schéma de validation pour le filtrage des produits
 */
export const filterSchema = z.object({
	search: searchSchema.optional(),
	categories: categoriesFilterSchema.optional(),
	options: optionsFilterSchema.optional(),
	priceRange: priceRangeFilterSchema.optional(),
	page: pageSchema.optional(),
	sortBy: sortBySchema.optional(),
	sortOrder: sortOrderSchema.optional(),
})

/**
 * Schéma pour les options de variante
 */
const variantOptionSchema = z.object({
	optionId: cuidSchema,
})

/**
 * Schéma pour les variantes de produit
 */
const productVariantSchema = z.object({
	sku: skuSchema,
	basePrice: priceSchema,
	price: priceSchema,
	stock: stockSchema,
	options: z.array(variantOptionSchema).optional(),
})

/**
 * Schéma de validation pour la création d'un produit
 */
export const createProductSchema = z.object({
	categoryId: cuidSchema,
	name: nameLongSchema,
	slug: slugSchema,
	description: descriptionSchema,
	basePrice: priceSchema,
	price: priceSchema,
	images: imagesSchema,
	metaTitle: metaTitleSchema,
	metaDescription: metaDescriptionSchema,
	variants: z.array(productVariantSchema).optional(),
})

/**
 * Schéma de validation pour la mise à jour d'un produit
 */
export const updateProductSchema = z.object({
	categoryId: cuidSchema.optional(),
	name: nameLongSchema.optional(),
	slug: slugSchema.optional(),
	description: descriptionSchema.optional(),
	basePrice: priceSchema.optional(),
	price: priceSchema.optional(),
	images: imagesSchema.optional(),
	metaTitle: metaTitleSchema.optional(),
	metaDescription: metaDescriptionSchema.optional(),
	variants: z.array(productVariantSchema).optional(),
})

/**
 * Schéma de validation pour les paramètres de route
 */
export const productIdSchema = z.object({
	id: cuidSchema,
})

export const relatedSchema = z.object({
	limit: limitSchema,
})

export const featuredSchema = z.object({
	limit: limitSchema,
})

export const productSlugSchema = z.object({
	slug: z.string().min(1, 'Le slug est requis'),
})

export const categorySlugSchema = z.object({
	categorySlug: z.string().min(1, 'Le slug de catégorie est requis'),
})

// Types
export type FilterInput = z.infer<typeof filterSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
export type RelatedInput = z.infer<typeof relatedSchema>
export type FeaturedInput = z.infer<typeof featuredSchema>
export type ProductSlugInput = z.infer<typeof productSlugSchema>
export type CategorySlugInput = z.infer<typeof categorySlugSchema>
