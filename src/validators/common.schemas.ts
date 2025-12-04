import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'

export enum SortBy {
	NAME = 'name',
	PRICE = 'price',
	CREATED_AT = 'createdAt',
}

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

// ========== Schémas d'identifiants ==========

/**
 * Schéma pour un CUID valide
 */
export const cuidSchema = z.cuid('ID invalide')

// ========== Schémas de texte ==========

/**
 * Schéma pour un email valide
 */
export const emailSchema = z.email('Email invalide').toLowerCase().trim()

/**
 * Schéma pour un mot de passe avec validation minimale
 */
export const passwordSchema = z
	.string({ message: 'Mot de passe requis' })
	.min(8, 'Le mot de passe doit contenir au moins 8 caractères')

/**
 * Schéma pour un nom (2-100 caractères)
 */
export const nameSchema = z
	.string({ message: 'Le nom est requis' })
	.min(2, 'Le nom doit contenir au moins 2 caractères')
	.max(100, 'Le nom ne peut pas dépasser 100 caractères')
	.trim()

/**
 * Schéma pour un nom de produit/catégorie (1-255 caractères)
 */
export const nameLongSchema = z
	.string({ message: 'Le nom est requis' })
	.min(1, 'Le nom est requis')
	.max(255, 'Le nom ne peut pas dépasser 255 caractères')
	.trim()

/**
 * Schéma pour un slug valide (minuscules, chiffres, tirets)
 */
export const slugSchema = z
	.string({ message: 'Le slug est requis' })
	.min(1, 'Le slug est requis')
	.max(255, 'Le slug ne peut pas dépasser 255 caractères')
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		'Le slug doit être en minuscules et ne peut contenir que des lettres, chiffres et tirets'
	)
	.trim()

/**
 * Schéma pour un SKU (1-100 caractères)
 */
export const skuSchema = z
	.string({ message: 'Le SKU est requis' })
	.min(1, 'Le SKU est requis')
	.max(100, 'Le SKU ne peut pas dépasser 100 caractères')

/**
 * Schéma pour une description optionnelle
 */
export const descriptionSchema = z.string().optional()

/**
 * Schéma pour un commentaire optionnel
 */
export const commentSchema = z
	.string({ message: 'Le commentaire est requis' })
	.min(1, 'Le commentaire est requis')
	.max(200, 'Le commentaire ne peut pas dépasser 200 caractères')

/**
 * Générateur de schéma pour string requis avec message personnalisé
 */
export const stringRequiredSchema = (field: string) =>
	z.string({ message: `${field} est requis` }).min(1, `${field} est requis`)

// ========== Schémas numériques ==========

/**
 * Schéma pour une quantité (entier >= 1)
 */
export const quantitySchema = z
	.number({ message: 'Quantité invalide' })
	.int('La quantité doit être un entier')
	.min(1, 'La quantité doit être au moins 1')

/**
 * Schéma pour un stock (entier >= 0)
 */
export const stockSchema = z
	.number({ message: 'Le stock est requis' })
	.int('Le stock doit être un nombre entier')
	.min(0, 'Le stock doit être positif')

/**
 * Schéma pour un prix (>= 0)
 */
export const priceSchema = z
	.number({ message: 'Le prix est requis' })
	.min(0, 'Le prix doit être positif')

/**
 * Schéma pour une note (1-5)
 */
export const ratingSchema = z
	.number({ message: 'La note est requise' })
	.int('La note doit être un entier')
	.min(1, 'La note doit être au moins 1')
	.max(5, 'La note doit être au maximum 5')

/**
 * Schéma pour un numéro de page (>= 1)
 */
export const pageSchema = z.string()

/**
 * Schéma pour une limite (1-100)
 */
export const limitSchema = z.string()

/**
 * Schéma pour un prix minimum (coercé, >= 0)
 */
export const minPriceSchema = z.string()

/**
 * Schéma pour un prix maximum (coercé, >= 0)
 */
export const maxPriceSchema = z.string()

/**
 * Schéma pour une plage de prix (objet avec min et max)
 */
export const priceRangeFilterSchema = z.object({
	min: z.number().min(0).optional(),
	max: z.number().min(0).optional(),
})

// ========== Schémas d'URL et médias ==========

/**
 * Schéma pour une URL valide
 */
export const urlSchema = z.url('URL invalide')

/**
 * Schéma pour un tableau d'URLs d'images
 */
export const imagesSchema = z.array(z.url("URL d'image invalide"))

// ========== Schémas de métadonnées SEO ==========

/**
 * Schéma pour un meta titre (max 60 caractères)
 */
export const metaTitleSchema = z
	.string()
	.max(60, 'Le meta titre ne peut pas dépasser 60 caractères')
	.optional()

/**
 * Schéma pour une meta description (max 160 caractères)
 */
export const metaDescriptionSchema = z
	.string()
	.max(160, 'La meta description ne peut pas dépasser 160 caractères')
	.optional()

// ========== Schémas de tri ==========

/**
 * Schéma pour le tri des produits
 */
export const sortBySchema = z.enum(SortBy)

/**
 * Schéma pour l'ordre de tri
 */
export const sortOrderSchema = z.enum(SortOrder)

// ========== Schémas de recherche et filtres ==========

/**
 * Schéma pour un terme de recherche
 */
export const searchSchema = z.string()

/**
 * Helper: transform string or string[] to string[]
 * Handles URL query params that can be either a single value or array
 */
const stringOrArrayToArray = z
	.union([z.string(), z.array(z.string())])
	.transform((val) => (Array.isArray(val) ? val : [val]))

/**
 * Schéma pour un tableau de catégories
 * Accepts both string and string[] from query params
 */
export const categoriesFilterSchema = stringOrArrayToArray

/**
 * Schéma pour un tableau d'options (couples attribut: option)
 * Format: [{attributeName: optionName}, ...]
 * Ex: [{Marque: "Apple"}, {Marque: "Samsung"}, {Poids: "5-10kg"}]
 */
export const optionsFilterSchema = z.array(z.record(z.string(), z.string()))

// ========== Schémas de position ==========

/**
 * Schéma pour une position (x, y)
 */
export const positionSchema = z.object({
	x: z.number(),
	y: z.number(),
})

// ========== Schémas d'adresse ==========

/**
 * Schéma pour une adresse complète
 * Note: Removed .refine() to be compatible with vee-validate-zod's getDefaults()
 */
export const addressSchema = z.object({
	id: z.string().nullable(),
	name: z.string().min(1, 'Le nom est requis'),
	email: z.email('Email invalide').toLowerCase().trim(),
	phone: z.string().refine(isValidPhoneNumber, {
		message: 'Veuillez entrer un numéro de téléphone valide',
	}),
	street: z.string().min(1, 'La rue est requise'),
	city: z.string().min(1, 'La ville est requise'),
	country: z.string().min(1, 'Le pays est requis'),
})

// ========== Schémas de coupon ==========

/**
 * Schéma pour un code coupon valide
 */
export const couponCodeSchema = z
	.string({ message: 'Le code coupon est requis' })
	.min(1, 'Le code coupon est requis')
	.max(50, 'Le code coupon ne peut pas dépasser 50 caractères')
	.trim()
	.toUpperCase()
