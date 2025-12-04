/**
 * Service de catégories
 */

import { toSlug } from '@/utils'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/validators/categories.validator'
import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/ApiError'

/**
 * Récupérer toutes les catégories avec filtres
 */
export const getAll = async () => {
	const categories = await prisma.categories.findMany({
		include: {
			parent: true,
			children: true,
			_count: {
				select: { products: true },
			},
		},
	})

	return categories
}

/**
 * Récupérer les catégories les plus vendues
 */
export const getBestSelling = async () => {
	// On récupère tous les order_items pour compter les quantités vendues, en respectant la structure OrderItemData de orders.service.ts.
	const sales = await prisma.order_items.findMany({
		select: {
			id: true,
			data: true, // OrderItemData est stocké ici (cf. orders.service.ts)
		},
	})

	// Construire une map categoryId -> total sold
	const salesMap = new Map<string, number>()

	for (const item of sales) {
		// item.data est du type OrderItemData : voir interface dans orders.service.ts
		// Il n'y a pas de lien direct à categoryId sur l'order_item, il faut parser item.data pour retrouver l'info éventuelle

		// Malheureusement, categoryId n'est pas dans OrderItemData, il va donc falloir faire un lookup des produits
		// Pour cela, on fait un batch : on collecte tous les skus de item.data, puis on fait une requête pour récupérer les categoryId correspondants

		// On commence par parser data
		let sku: string | undefined = undefined
		if (typeof item.data === 'object' && item.data !== null && 'sku' in item.data) {
			sku = (item.data as any).sku
		}
		if (!sku) continue
		salesMap.set(
			sku,
			(salesMap.get(sku) || 0) +
				(typeof (item.data as any).quantity === 'number' ? (item.data as any).quantity : 0)
		)
	}

	// On mappe les SKU aux categoryId de leurs produits
	const skus = Array.from(salesMap.keys())
	if (skus.length === 0) {
		// Pas de ventes → retourne les catégories telles quelles
		return await prisma.categories.findMany({
			include: {
				parent: true,
				children: true,
				_count: { select: { products: true } },
			},
		})
	}

	const products = await prisma.products.findMany({
		where: { sku: { in: skus } },
		select: { sku: true, categoryId: true },
	})

	// On crée une map sku => categoryId
	const skuToCategoryId = new Map<string, string>()
	for (const p of products) {
		if (p.categoryId) {
			skuToCategoryId.set(p.sku, p.categoryId)
		}
	}

	// On cumule les quantités vendues par catégorie
	const categorySalesMap = new Map<string, number>()
	for (const [sku, totalSold] of salesMap.entries()) {
		const categoryId = skuToCategoryId.get(sku)
		if (!categoryId) continue
		categorySalesMap.set(categoryId, (categorySalesMap.get(categoryId) || 0) + totalSold)
	}

	const categories = await prisma.categories.findMany({
		include: {
			parent: true,
			children: true,
			_count: { select: { products: true } },
		},
	})

	const hasSales = [...categorySalesMap.values()].some((v) => v > 0)
	if (!hasSales) {
		return categories
	}

	// Trier par nombre de ventes décroissant
	return categories.sort(
		(a, b) => (categorySalesMap.get(b.id) || 0) - (categorySalesMap.get(a.id) || 0)
	)
}

/**
 * Récupérer une catégorie par slug
 */
export const getOne = async (slug: string) => {
	const category = await prisma.categories.findUnique({
		where: { slug },
		include: {
			parent: true,
			children: true,
			_count: { select: { products: true } },
		},
	})

	if (!category) {
		throw new NotFoundError('Catégorie non trouvée !')
	}

	return category
}

/**
 * Récupérer une catégorie par ID
 */
export const getById = async (id: string) => {
	const category = await prisma.categories.findUnique({
		where: { id },
		include: {
			parent: true,
			children: true,
			_count: { select: { products: true } },
		},
	})

	if (!category) {
		throw new NotFoundError('Catégorie non trouvée !')
	}

	return category
}

/**
 * Créer une nouvelle catégorie
 */
export const create = async (data: CreateCategoryInput) => {
	const { parentId, ...categoryData } = data

	// Vérifier que le slug n'existe pas déjà
	const existingCategory = await prisma.categories.findUnique({
		where: { slug: toSlug(categoryData.name) },
	})

	if (existingCategory) {
		throw new BadRequestError('Une catégorie avec ce slug existe déjà !')
	}

	// Vérifier que le parent existe si fourni
	if (parentId) {
		const parent = await prisma.categories.findUnique({
			where: { id: parentId },
		})

		if (!parent) {
			throw new NotFoundError('Catégorie parente non trouvée !')
		}
	}

	const category = await prisma.categories.create({
		data: {
			...categoryData,
			slug: toSlug(categoryData.name),
			parentId,
			position: categoryData.position ?? {},
			isActive: true,
		},
		include: {
			parent: true,
		},
	})

	return category
}

/**
 * Mettre à jour une catégorie
 */
export const update = async (id: string, data: UpdateCategoryInput) => {
	const { parentId, ...categoryData } = data

	// Vérifier que la catégorie existe
	const existingCategory = await prisma.categories.findUnique({
		where: { id },
	})

	if (!existingCategory) {
		throw new NotFoundError('Catégorie non trouvée !')
	}

	// Vérifier que le slug n'est pas déjà utilisé par une autre catégorie
	if (categoryData.name && toSlug(categoryData.name) !== existingCategory.slug) {
		const slugExists = await prisma.categories.findUnique({
			where: { slug: toSlug(categoryData.name) },
		})

		if (slugExists) {
			throw new BadRequestError('Une catégorie avec ce slug existe déjà !')
		}
	}

	// Vérifier que le parent existe si fourni
	if (parentId) {
		// Empêcher une catégorie d'être son propre parent
		if (parentId === id) {
			throw new BadRequestError('Une catégorie ne peut pas être son propre parent !')
		}

		const parent = await prisma.categories.findUnique({
			where: { id: parentId },
		})

		if (!parent) {
			throw new NotFoundError('Catégorie parente non trouvée !')
		}
	}

	const category = await prisma.categories.update({
		where: { id },
		data: {
			...categoryData,
			slug: categoryData.name ? toSlug(categoryData.name) : existingCategory.slug,
			parentId,
		},
		include: {
			parent: true,
		},
	})

	return category
}

/**
 * Supprimer une catégorie
 */
export const remove = async (id: string) => {
	// Vérifier que la catégorie existe
	const existingCategory = await prisma.categories.findUnique({
		where: { id },
		include: {
			products: true,
			children: true,
		},
	})

	if (!existingCategory) {
		throw new NotFoundError('Catégorie non trouvée !')
	}

	// Vérifier s'il y a des produits associés
	if (existingCategory.products.length > 0) {
		throw new BadRequestError(
			"Impossible de supprimer une catégorie contenant des produits. Veuillez déplacer ou supprimer les produits d'abord !"
		)
	}

	// Vérifier s'il y a des sous-catégories
	if (existingCategory.children.length > 0) {
		throw new BadRequestError(
			"Impossible de supprimer une catégorie ayant des sous-catégories. Veuillez supprimer les sous-catégories d'abord !"
		)
	}

	await prisma.categories.delete({
		where: { id },
	})

	return { message: 'Catégorie supprimée avec succès !' }
}
