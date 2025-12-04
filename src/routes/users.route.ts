import {
	changePassword,
	getProfile,
	updateProfile,
	updateProfileImage,
} from '@/controllers/users.controller'
import { authenticate } from '@/middlewares/auth.middleware'
import { validateBody } from '@/middlewares/validate.middleware'
import {
	changePasswordSchema,
	updateProfileImageSchema,
	updateProfileSchema,
} from '@/validators/users.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

// All routes require authentication
router.use(authenticate)

// Get current user profile
router.get('/me', getProfile)

// Update current user profile
router.patch('/me', validateBody(updateProfileSchema), updateProfile)

// Update profile image
router.patch('/me/image', validateBody(updateProfileImageSchema), updateProfileImage)

// Change password
router.patch('/me/password', validateBody(changePasswordSchema), changePassword)

export default router
