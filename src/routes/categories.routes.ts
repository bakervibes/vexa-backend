import {
	createCategory,
	deleteCategory,
	getAll,
	getBestSelling,
	getOne,
	updateCategory,
} from '@/controllers/categories.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { strictLimiter } from '@/middlewares/rateLimiter.middleware'
import { validateBody, validateParams } from '@/middlewares/validate.middleware'
import {
	categoryIdSchema,
	categorySlugSchema,
	createCategorySchema,
	updateCategorySchema,
} from '@/validators/categories.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.get('/', strictLimiter, getAll)

router.get('/best-selling', strictLimiter, getBestSelling)

router.get('/:slug', strictLimiter, validateParams(categorySlugSchema), getOne)

router.post(
	'/',
	authenticate,
	authorize('ADMIN'),
	validateBody(createCategorySchema),
	createCategory
)

router.patch(
	'/:id',
	authenticate,
	authorize('ADMIN'),
	validateParams(categoryIdSchema),
	validateBody(updateCategorySchema),
	updateCategory
)

router.delete(
	'/:id',
	authenticate,
	authorize('ADMIN'),
	validateParams(categoryIdSchema),
	deleteCategory
)

export default router
