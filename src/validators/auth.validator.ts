import { z } from 'zod'

// ========== Schémas de base ==========

const emailSchema = z.string().email('Email invalide').toLowerCase().trim()

const passwordSchema = z
	.string({ message: 'Mot de passe requis' })
	.min(8, 'Le mot de passe doit contenir au moins 8 caractères')

const nameSchema = z
	.string({ message: 'Nom requis' })
	.min(2, 'Le nom doit contenir au moins 2 caractères')
	.max(100, 'Le nom ne peut pas dépasser 100 caractères')
	.trim()

// ========== Schémas de validation ==========

export const registerBodySchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	name: nameSchema,
})

export const loginBodySchema = z.object({
	email: emailSchema,
	password: z.string({ message: 'Mot de passe requis' }),
})

export const refreshTokenBodySchema = z.object({
	refreshToken: z.string({ message: 'Refresh token requis' }),
})

// ========== Types inférés ==========

export type RegisterInput = z.infer<typeof registerBodySchema>
export type LoginInput = z.infer<typeof loginBodySchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenBodySchema>
