import {
	createProduct,
	deleteProduct,
	getAll,
	getByCategory,
	getFeatured,
	getOne,
	getRelated,
	updateProduct,
} from '@/controllers/products.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { validateBody, validateParams, validateQuery } from '@/middlewares/validate.middleware'
import {
	categorySlugSchema,
	createProductSchema,
	filterSchema,
	limitSchema,
	productIdSchema,
	relatedSchema,
	updateProductSchema,
} from '@/validators/products.validator'
import { Router, type Router as ExpressRouter } from 'express'
import { strictLimiter } from '../middlewares/rateLimiter.middleware'

const router: ExpressRouter = Router()

/**
 * @route   GET /api/products/featured
 * @desc    Récupérer les produits en vedette
 * @access  Public
 */
router.get(
	'/featured',
	strictLimiter,
	validateQuery(limitSchema),
	// @ts-expect-error - Les middlewares de validation garantissent les types corrects
	getFeatured
)

/**
 * @route   GET /api/products/category/:categorySlug
 * @desc    Récupérer les produits par catégorie
 * @access  Public
 */
router.get(
	'/category/:categorySlug',
	strictLimiter,
	validateParams(categorySlugSchema),
	validateQuery(filterSchema),
	// @ts-expect-error - Les middlewares de validation garantissent les types corrects
	getByCategory
)

/**
 * @route   GET /api/products/:id/related
 * @desc    Récupérer les produits similaires
 * @access  Public
 */
router.get(
	'/:id/related',
	strictLimiter,
	validateParams(productIdSchema),
	validateQuery(relatedSchema),
	// @ts-expect-error - Les middlewares de validation garantissent les types corrects
	getRelated
)

/**
 * @route   GET /api/products
 * @desc    Récupérer tous les produits
 * @access  Public
 */
// @ts-expect-error - Les middlewares de validation garantissent les types corrects
router.get('/', strictLimiter, validateQuery(filterSchema), getAll)

/**
 * @route   GET /api/products/:slug
 * @desc    Récupérer un produit par slug
 * @access  Public
 */
router.get('/:slug', strictLimiter, getOne)

/**
 * @route   POST /api/products
 * @desc    Créer un nouveau produit
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('ADMIN'), validateBody(createProductSchema), createProduct)

/**
 * @route   PUT /api/products/:id
 * @desc    Mettre à jour un produit
 * @access  Private (Admin)
 */
router.patch(
	'/:id',
	authenticate,
	authorize('ADMIN'),
	validateParams(productIdSchema),
	validateBody(updateProductSchema),
	updateProduct
)

/**
 * @route   DELETE /api/products/:id
 * @desc    Supprimer un produit
 * @access  Private (Admin)
 */
router.delete(
	'/:id',
	authenticate,
	authorize('ADMIN'),
	validateParams(productIdSchema),
	deleteProduct
)

export default router
