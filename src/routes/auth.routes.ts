/**
 * EXEMPLE DE ROUTES D'AUTHENTIFICATION
 * Renommer en auth.routes.ts et décommenter dans app.ts
 */

import { Router, type Router as ExpressRouter } from 'express'
import {
	getMe,
	login,
	logout,
	refreshToken,
	register
} from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth'
import { strictLimiter } from '../middlewares/rateLimiter'
import { validateBody } from '../middlewares/validate'
import {
	loginSchema,
	refreshTokenSchema,
	registerSchema
} from '../validators/auth.validator'

const router: ExpressRouter = Router()

/**
 * @route   POST /api/auth/register
 * @desc    Créer un nouveau compte utilisateur
 * @access  Public
 */
router.post('/register', strictLimiter, validateBody(registerSchema), register)

/**
 * @route   POST /api/auth/login
 * @desc    Se connecter
 * @access  Public
 */
router.post('/login', strictLimiter, validateBody(loginSchema), login)

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir le token d'accès
 * @access  Public
 */
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken)

/**
 * @route   POST /api/auth/logout
 * @desc    Se déconnecter
 * @access  Private
 */
router.post('/logout', authenticate, logout)

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authenticate, getMe)

export default router
