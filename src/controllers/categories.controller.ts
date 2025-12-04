/**
 * Categories Controller
 */

import type {
	CategoryIdInput,
	CategorySlugInput,
	CreateCategoryInput,
	UpdateCategoryInput,
} from '@/validators/categories.validator'
import * as categoriesService from '../services/categories.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get all categories
 */
export const getAll = asyncHandler(async (_req, res) => {
	const result = await categoriesService.getAll()

	sendSuccess(res, result, 'Categories retrieved successfully !')
})

/**
 * Get best selling categories
 */
export const getBestSelling = asyncHandler(async (_req, res) => {
	const result = await categoriesService.getBestSelling()

	sendSuccess(res, result, 'Best selling categories retrieved successfully !')
})

/**
 * Get a category by slug
 */
export const getOne = asyncHandler<{
	params: CategorySlugInput
}>(async (req, res) => {
	const { slug } = req.params

	const result = await categoriesService.getOne(slug)

	sendSuccess(res, result, 'Category retrieved successfully !')
})

/**
 * Create a category
 */
export const createCategory = asyncHandler<{
	body: CreateCategoryInput
}>(async (req, res) => {
	const data = req.body

	const result = await categoriesService.create(data)

	sendSuccess(res, result, 'Category created successfully !')
})

/**
 * Update a category
 */
export const updateCategory = asyncHandler<{
	body: UpdateCategoryInput
	params: CategoryIdInput
}>(async (req, res) => {
	const data = req.body
	const { id } = req.params

	const result = await categoriesService.update(id, data)

	sendSuccess(res, result, 'Category updated successfully')
})

/**
 * Delete a category
 */
export const deleteCategory = asyncHandler<{
	params: CategoryIdInput
}>(async (req, res) => {
	const { id } = req.params

	const result = await categoriesService.remove(id)

	sendSuccess(res, result, 'Category deleted successfully !')
})
