import { z } from 'zod'
import { emailSchema, nameSchema, passwordSchema } from './common.schemas'

// ========== Schémas de validation ==========

export const registerSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
})

export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
})

export const refreshTokenSchema = z.object({
	refreshToken: z.string({ message: 'Refresh token requis' }),
})

// ========== Types inférés ==========

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
