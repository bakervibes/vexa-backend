import {
	createProduct,
	deleteProduct,
	getAll,
	getByCategory,
	getFeatured,
	getOne,
	getRecentDiscount,
	getRelated,
	updateProduct,
} from '@/controllers/products.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { validateBody, validateParams, validateQuery } from '@/middlewares/validate.middleware'
import {
	categorySlugSchema,
	createProductSchema,
	filterSchema,
	productIdSchema,
	productSlugSchema,
	updateProductSchema,
} from '@/validators/products.validator'
import { Router, type Router as ExpressRouter } from 'express'
import { strictLimiter } from '../middlewares/rateLimiter.middleware'

const router: ExpressRouter = Router()

router.get('/featured', strictLimiter, getFeatured)

router.get('/recent-discount', strictLimiter, getRecentDiscount)

router.get(
	'/category/:categorySlug',
	strictLimiter,
	validateParams(categorySlugSchema),
	validateQuery(filterSchema),
	getByCategory
)

router.post('/', strictLimiter, validateBody(filterSchema), getAll)

router.post('/', authenticate, authorize('ADMIN'), validateBody(createProductSchema), createProduct)

router.get('/:slug/related', strictLimiter, validateParams(productSlugSchema), getRelated)

router.get('/:slug', strictLimiter, getOne)

router.patch(
	'/:id',
	authenticate,
	authorize('ADMIN'),
	validateParams(productIdSchema),
	validateBody(updateProductSchema),
	updateProduct
)

router.delete(
	'/:id',
	authenticate,
	authorize('ADMIN'),
	validateParams(productIdSchema),
	deleteProduct
)

export default router
