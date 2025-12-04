import * as authController from '@/controllers/auth.controller'
import { authenticate } from '@/middlewares/auth.middleware'
import { validateBody } from '@/middlewares/validate.middleware'
import { loginSchema, refreshTokenSchema, registerSchema } from '@/validators/auth.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.post('/register', validateBody(registerSchema), authController.register)

router.post('/login', validateBody(loginSchema), authController.login)

router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken)

router.get('/me', authenticate, authController.getMe)

router.post('/logout', authenticate, authController.logout)

export default router
