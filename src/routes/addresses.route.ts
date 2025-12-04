import {
	createAddress,
	deleteAddress,
	getAddress,
	getUserAddresses,
	setDefaultAddress,
	updateAddress,
} from '@/controllers/addresses.controller'
import { authenticate } from '@/middlewares/auth.middleware'
import { validateBody, validateParams } from '@/middlewares/validate.middleware'
import {
	addressIdSchema,
	createAddressSchema,
	updateAddressSchema,
} from '@/validators/addresses.validator'
import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

// All routes require authentication
router.use(authenticate)

// Get all addresses for the current user
router.get('/', getUserAddresses)

// Create a new address
router.post('/', validateBody(createAddressSchema), createAddress)

// Get a single address by ID
router.get('/:id', validateParams(addressIdSchema), getAddress)

// Update an address
router.patch(
	'/:id',
	validateParams(addressIdSchema),
	validateBody(updateAddressSchema),
	updateAddress
)

// Delete an address
router.delete('/:id', validateParams(addressIdSchema), deleteAddress)

// Set an address as default
router.patch('/:id/default', validateParams(addressIdSchema), setDefaultAddress)

export default router
