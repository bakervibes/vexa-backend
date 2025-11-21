/**
 * EXEMPLE DE ROUTES D'AUTHENTIFICATION
 * Renommer en auth.routes.ts et décommenter dans app.ts
 */

import * as authController from '@/controllers/auth.controller'
import { authenticate } from '@/middlewares/auth.middleware'
import { validateBody } from '@/middlewares/validate.middleware'
import {
	loginBodySchema,
	refreshTokenBodySchema,
	registerBodySchema,
} from '@/validators/auth.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

// ========== Routes publiques ==========

// POST /auth/register - Créer un compte
router.post('/register', validateBody(registerBodySchema), authController.register)

// POST /auth/login - Se connecter
router.post('/login', validateBody(loginBodySchema), authController.login)

// POST /auth/refresh - Rafraîchir le token
router.post('/refresh', validateBody(refreshTokenBodySchema), authController.refreshToken)

// ========== Routes protégées ==========

// GET /auth/me - Obtenir l'utilisateur connecté
router.get('/me', authenticate, authController.getMe)

// POST /auth/logout - Se déconnecter
router.post('/logout', authenticate, authController.logout)

export default router
