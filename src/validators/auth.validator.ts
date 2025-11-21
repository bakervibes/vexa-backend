import { z } from 'zod'

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
	name: z
		.string({ message: 'Le nom est requis' })
		.min(2, 'Le nom doit contenir au moins 2 caractères')
		.max(100, 'Le nom ne peut pas dépasser 100 caractères')
		.trim(),

	email: z.email('Email invalide').toLowerCase().trim(),

	password: z
		.string({ message: 'Le mot de passe est requis' })
		.min(8, 'Le mot de passe doit contenir au moins 8 caractères')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
		),
})

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
	email: z.email('Email invalide').toLowerCase().trim(),

	password: z
		.string({ message: 'Le mot de passe est requis' })
		.min(1, 'Le mot de passe est requis'),
})

/**
 * Schéma de validation pour le refresh token
 */
export const refreshTokenSchema = z.object({
	refreshToken: z
		.string({ message: 'Le refresh token est requis' })
		.min(1, 'Le refresh token est requis'),
})

/**
 * Schéma de validation pour la mise à jour du profil
 */
export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(2, 'Le nom doit contenir au moins 2 caractères')
		.max(100, 'Le nom ne peut pas dépasser 100 caractères')
		.trim()
		.optional(),

	email: z.email('Email invalide').toLowerCase().trim().optional(),
})

/**
 * Schéma de validation pour le changement de mot de passe
 */
export const changePasswordSchema = z
	.object({
		currentPassword: z
			.string({ message: 'Le mot de passe actuel est requis' })
			.min(1, 'Le mot de passe actuel est requis'),

		newPassword: z
			.string({ message: 'Le nouveau mot de passe est requis' })
			.min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
			),
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "Le nouveau mot de passe doit être différent de l'ancien",
		path: ['newPassword'],
	})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
