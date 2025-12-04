import { z } from 'zod'
import {
	cuidSchema,
	descriptionSchema,
	nameLongSchema,
	positionSchema,
	slugSchema,
	urlSchema,
} from './common.schemas'

// ========== Schémas spécifiques ==========

export const createCategorySchema = z.object({
	name: nameLongSchema,
	description: descriptionSchema,
	image: urlSchema,
	position: positionSchema,
	parentId: cuidSchema.optional(),
})

export const updateCategorySchema = z.object({
	name: nameLongSchema.optional(),
	description: descriptionSchema.optional(),
	image: urlSchema.optional(),
	position: positionSchema.optional(),
	parentId: cuidSchema.optional(),
})

export const categoryIdSchema = z.object({
	id: cuidSchema,
})

export const categorySlugSchema = z.object({
	slug: slugSchema,
})

// ========== Types inférés ==========

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryIdInput = z.infer<typeof categoryIdSchema>
export type CategorySlugInput = z.infer<typeof categorySlugSchema>
