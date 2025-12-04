import { config } from '@/config/env'
import { uploadRouter } from '@/uploadthing'
import { Router, type Router as ExpressRouter } from 'express'
import { createRouteHandler } from 'uploadthing/express'

const router: ExpressRouter = Router()

// Create uploadthing route handler
// Note: Authentication is handled in the uploadRouter middleware, not here
// because UploadThing needs some routes accessible without our JWT auth
router.use(
	'/',
	createRouteHandler({
		router: uploadRouter,
		config: {
			token: config.uploadthing.token,
		},
	})
)

export default router
