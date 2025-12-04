import { getFilters } from '@/controllers/filters.controller'
import { Router, type Router as ExpressRouter } from 'express'
import { strictLimiter } from '../middlewares/rateLimiter.middleware'

const router: ExpressRouter = Router()

/**
 * GET /filters
 * Get all available filters (categories, attributes with options, price range)
 */
router.get('/', strictLimiter, getFilters)

export default router
