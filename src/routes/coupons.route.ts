import {
	applyCoupon,
	getActiveCoupons,
	getCouponByCode,
	validateCoupon,
} from '@/controllers/coupons.controller'
import { optionalAuth } from '@/middlewares/auth.middleware'
import { validateBody, validateQuery } from '@/middlewares/validate.middleware'
import { applyCouponSchema, validateCouponSchema } from '@/validators/coupons.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

router.use(optionalAuth)

router.get('/', getActiveCoupons)

router.get('/validate', validateQuery(validateCouponSchema), validateCoupon)

router.get('/:code', getCouponByCode)

router.post('/apply', validateBody(applyCouponSchema), applyCoupon)

export default router
