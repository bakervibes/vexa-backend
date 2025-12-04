/**
 * Filters Controller
 */

import * as filtersService from '../services/filters.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Get all available filters (categories, attributes with options, price range)
 */
export const getFilters = asyncHandler(async (_req, res) => {
	const result = await filtersService.getFilters()

	sendSuccess(res, result, 'Filters retrieved successfully !')
})
