/**
 * EXEMPLE DE CONTROLLER D'AUTHENTIFICATION
 * Renommer en auth.controller.ts pour l'utiliser
 */

import type {
	CreateProductInput,
	FilterInput,
	UpdateProductInput,
} from '@/validators/products.validator'
import * as productsService from '../services/products.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Récupérer tous les produits
 */
export const getAll = asyncHandler<{ query?: FilterInput }>(async (req, res) => {
	const { query } = req

	const result = await productsService.getAll(query)

	sendSuccess(res, result, 'Produits récupérés avec succès !')
})

/**
 * Récupérer un produit
 */
export const getOne = asyncHandler<{
	params: { slug: string }
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
	const { body } = req

	const result = await productsService.create(body)

	sendSuccess(res, result, 'Produit créé avec succès !')
})

/**
 * Créer un produit
 */
export const updateProduct = asyncHandler<{
	body: UpdateProductInput
	params: { id: string }
}>(async (req, res) => {
	const { body, params } = req

	const result = await productsService.update(params.id, body)

	sendSuccess(res, result, 'Produit mis à jour avec succès !')
})

/**
 * Créer un produit
 */
export const deleteProduct = asyncHandler<{
	params: { id: string }
}>(async (req, res) => {
	const { params } = req

	const result = await productsService.remove(params.id)

	sendSuccess(res, result, 'Produit supprimé avec succès !')
})

/**
 * Récupérer les produits par catégorie
 */
export const getByCategory = asyncHandler<{
	params: { categorySlug: string }
	query?: FilterInput
}>(async (req, res) => {
	const { params, query } = req

	const result = await productsService.getByCategory(params.categorySlug, query)

	sendSuccess(res, result, 'Produits récupérés avec succès !')
})

/**
 * Récupérer les produits en vedette
 */
export const getFeatured = asyncHandler<{
	query?: { limit?: string }
}>(async (req, res) => {
	const limit = req.query?.limit ? parseInt(req.query.limit, 10) : 8

	const result = await productsService.getFeatured(limit)

	sendSuccess(res, result, 'Produits en vedette récupérés avec succès !')
})

/**
 * Récupérer les produits similaires
 */
export const getRelated = asyncHandler<{
	params: { id: string }
	query?: { limit?: string }
}>(async (req, res) => {
	const { id } = req.params
	const limit = req.query?.limit ? parseInt(req.query.limit, 10) : 4

	const result = await productsService.getRelated(id, limit)

	sendSuccess(res, result, 'Produits similaires récupérés avec succès !')
})
