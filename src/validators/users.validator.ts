import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'
import { emailSchema, nameSchema, passwordSchema } from './common.schemas'

// ========== Schémas de validation ==========

export const updateProfileSchema = z.object({
	name: nameSchema.optional(),
	email: emailSchema.optional(),
	phone: z
		.string()
		.refine((value) => !value || value.trim() === '' || isValidPhoneNumber(value), {
			message: 'Veuillez entrer un numéro de téléphone valide',
		})
		.optional(),
})

export const changePasswordSchema = z.object({
	currentPassword: passwordSchema,
	newPassword: passwordSchema,
})

export const updateProfileImageSchema = z.object({
	imageUrl: z.url('Invalid image URL'),
})

// ========== Types inférés ==========

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateProfileImageInput = z.infer<typeof updateProfileImageSchema>
