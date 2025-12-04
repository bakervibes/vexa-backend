/**
 * Products Controller
 */

import type {
	CategorySlugInput,
	CreateProductInput,
	FilterInput,
	ProductIdInput,
	ProductSlugInput,
	UpdateProductInput,
} from '@/validators/products.validator'
import * as productsService from '../services/products.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get all products
 */
export const getAll = asyncHandler<{ body: FilterInput }>(async (req, res) => {
	const filters = req.body

	const result = await productsService.getAll(filters)

	sendSuccess(res, result, 'Products retrieved successfully !')
})

/**
 * Get a product
 */
export const getOne = asyncHandler<{
	params: ProductSlugInput
}>(async (req, res) => {
	const { slug } = req.params

	const result = await productsService.getOne(slug)

	sendSuccess(res, result, 'Product retrieved successfully !')
})

/**
 * Create a product
 */
export const createProduct = asyncHandler<{
	body: CreateProductInput
}>(async (req, res) => {
	const data = req.body

	const result = await productsService.create(data)

	sendSuccess(res, result, 'Product created successfully !')
})

/**
 * Update a product
 */
export const updateProduct = asyncHandler<{
	body: UpdateProductInput
	params: ProductIdInput
}>(async (req, res) => {
	const data = req.body

	const { id } = req.params

	const result = await productsService.update(id, data)

	sendSuccess(res, result, 'Product updated successfully')
})

/**
 * Delete a product
 */
export const deleteProduct = asyncHandler<{
	params: ProductIdInput
}>(async (req, res) => {
	const { id } = req.params

	const result = await productsService.remove(id)

	sendSuccess(res, result, 'Product deleted successfully !')
})

/**
 * Get products by category
 */
export const getByCategory = asyncHandler<{
	params: CategorySlugInput
	query: FilterInput
}>(async (req, res) => {
	const { categorySlug } = req.params

	const query = req.query

	const result = await productsService.getByCategory(categorySlug, query)

	sendSuccess(res, result, 'Products retrieved successfully !')
})

/**
 * Get featured products
 */
export const getFeatured = asyncHandler(async (_req, res) => {
	const result = await productsService.getFeatured()

	sendSuccess(res, result, 'Featured products retrieved successfully !')
})

/**
 * Get related products
 */
export const getRelated = asyncHandler<{
	params: ProductSlugInput
}>(async (req, res) => {
	const { slug } = req.params

	const result = await productsService.getRelated(slug)

	sendSuccess(res, result, 'Related products retrieved successfully !')
})

/**
 * Get most recent discounted product
 */
export const getRecentDiscount = asyncHandler(async (_req, res) => {
	const result = await productsService.getRecentDiscount()

	sendSuccess(res, result, 'Product retrieved successfully !')
})
