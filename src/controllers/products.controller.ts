/**
 * EXEMPLE DE CONTROLLER D'AUTHENTIFICATION
 * Renommer en auth.controller.ts pour l'utiliser
 */

import type {
	CategorySlugInput,
	CreateProductInput,
	FilterInput,
	LimitInput,
	ProductIdInput,
	ProductSlugInput,
	RelatedInput,
	UpdateProductInput,
} from '@/validators/products.validator'
import * as productsService from '../services/products.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Récupérer tous les produits
 */
export const getAll = asyncHandler<{ query: FilterInput }>(async (req, res) => {
	const query = req.query

	const result = await productsService.getAll(query)

	sendSuccess(res, result, 'Produits récupérés avec succès !')
})

/**
 * Récupérer un produit
 */
export const getOne = asyncHandler<{
	params: ProductSlugInput
}>(async (req, res) => {
	const { slug } = req.params

	const result = await productsService.getOne(slug)

	sendSuccess(res, result, 'Produit récupéré avec succès !')
})

/**
 * Créer un produit
 */
export const createProduct = asyncHandler<{
	body: CreateProductInput
}>(async (req, res) => {
	const data = req.body

	const result = await productsService.create(data)

	sendSuccess(res, result, 'Produit créé avec succès !')
})

/**
 * Mettre à jour un produit
 */
export const updateProduct = asyncHandler<{
	body: UpdateProductInput
	params: ProductIdInput
}>(async (req, res) => {
	const data = req.body

	const { id } = req.params

	const result = await productsService.update(id, data)

	sendSuccess(res, result, 'Produit mis à jour avec succès !')
})

/**
 * Supprimer un produit
 */
export const deleteProduct = asyncHandler<{
	params: ProductIdInput
}>(async (req, res) => {
	const { id } = req.params

	const result = await productsService.remove(id)

	sendSuccess(res, result, 'Produit supprimé avec succès !')
})

/**
 * Récupérer les produits par catégorie
 */
export const getByCategory = asyncHandler<{
	params: CategorySlugInput
	query: FilterInput
}>(async (req, res) => {
	const { categorySlug } = req.params

	const query = req.query

	const result = await productsService.getByCategory(categorySlug, query)

	sendSuccess(res, result, 'Produits récupérés avec succès !')
})

/**
 * Récupérer les produits en vedette
 */
export const getFeatured = asyncHandler<{
	query: LimitInput
}>(async (req, res) => {
	const limit = req.query?.limit

	const result = await productsService.getFeatured(limit)

	sendSuccess(res, result, 'Produits en vedette récupérés avec succès !')
})

/**
 * Récupérer les produits similaires
 */
export const getRelated = asyncHandler<{
	params: ProductIdInput
	query: RelatedInput
}>(async (req, res) => {
	const { id } = req.params

	const limit = req.query?.limit

	const result = await productsService.getRelated(id, limit)

	sendSuccess(res, result, 'Produits similaires récupérés avec succès !')
})
