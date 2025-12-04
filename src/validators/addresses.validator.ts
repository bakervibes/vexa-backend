import { z } from 'zod'
import { addressSchema, cuidSchema } from './common.schemas'

// ========== Schémas spécifiques ==========

export const createAddressSchema = addressSchema.extend({
	isDefault: z.boolean(),
})

export const updateAddressSchema = addressSchema.partial().extend({
	isDefault: z.boolean().optional(),
})

export const addressIdSchema = z.object({
	id: cuidSchema,
})

// ========== Types inférés ==========

export type CreateAddressInput = z.infer<typeof createAddressSchema>
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>
export type AddressIdInput = z.infer<typeof addressIdSchema>
