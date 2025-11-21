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
import { authenticate, authorize } from '@/middlewares/auth'
import { validateBody, validateParams, validateQuery } from '@/middlewares/validate'
import {
	categorySlugSchema,
	createProductSchema,
	filterSchema,
	productIdSchema,
	updateProductSchema,
} from '@/validators/products.validator'
import { Router, type Router as ExpressRouter } from 'express'
import { strictLimiter } from '../middlewares/rateLimiter'

const router: ExpressRouter = Router()

/**
 * @route   GET /api/products/featured
 * @desc    Récupérer les produits en vedette
 * @access  Public
 */
router.get('/featured', strictLimiter, getFeatured)

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
	getByCategory as any
)

/**
 * @route   GET /api/products/:id/related
 * @desc    Récupérer les produits similaires
 * @access  Public
 */
router.get('/:id/related', strictLimiter, validateParams(productIdSchema), getRelated)

/**
 * @route   GET /api/products
 * @desc    Récupérer tous les produits
 * @access  Public
 */
router.get('/', strictLimiter, validateQuery(filterSchema), getAll as any)

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
router.put(
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
