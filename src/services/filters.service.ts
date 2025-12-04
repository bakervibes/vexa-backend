/**
 * Service de filtres
 * Récupère les filtres disponibles pour le shop (catégories, attributs/options, prix min/max)
 */

import { prisma } from '../config/database'

/**
 * Interface pour les attributs avec leurs options
 */
interface AttributeWithOptions {
	id: string
	name: string
	slug: string
	options: {
		id: string
		name: string
		slug: string
	}[]
}

/**
 * Interface pour la réponse des filtres
 */
export interface FiltersResponse {
	categories: {
		id: string
		name: string
		slug: string
		image: string
	}[]
	attributes: AttributeWithOptions[]
	priceRange: {
		min: number
		max: number
	}
}

/**
 * Récupérer tous les filtres disponibles
 */
export const getFilters = async (): Promise<FiltersResponse> => {
	// Récupérer les catégories actives
	const categories = await prisma.categories.findMany({
		where: { isActive: true },
		select: {
			id: true,
			name: true,
			slug: true,
			image: true,
		},
		orderBy: { name: 'asc' },
	})

	// Récupérer les attributs actifs avec leurs options actives
	const attributes = await prisma.attributes.findMany({
		where: { isActive: true },
		select: {
			id: true,
			name: true,
			slug: true,
			options: {
				where: { isActive: true },
				select: {
					id: true,
					name: true,
					slug: true,
				},
				orderBy: { name: 'asc' },
			},
		},
		orderBy: { name: 'asc' },
	})

	// Récupérer le prix min/max en tenant compte des variantes
	// Pour les produits avec variantes, on utilise le prix de la variante
	// Pour les produits sans variante, on utilise le prix du produit
	const [productsAgg, variantsAgg] = await Promise.all([
		// Prix des produits sans variantes (price non null)
		prisma.products.aggregate({
			where: {
				isActive: true,
				price: { not: null },
			},
			_min: { price: true },
			_max: { price: true },
		}),
		// Prix des variantes (pour les produits avec variantes)
		prisma.product_variants.aggregate({
			where: {
				isActive: true,
				product: { isActive: true },
			},
			_min: { price: true },
			_max: { price: true },
		}),
	])

	// Calculer le min et max global
	const prices: number[] = []

	if (productsAgg._min.price !== null) prices.push(productsAgg._min.price)
	if (productsAgg._max.price !== null) prices.push(productsAgg._max.price)
	if (variantsAgg._min.price !== null) prices.push(variantsAgg._min.price)
	if (variantsAgg._max.price !== null) prices.push(variantsAgg._max.price)

	const priceRange = {
		min: prices.length > 0 ? Math.min(...prices) : 0,
		max: prices.length > 0 ? Math.max(...prices) : 0,
	}

	return {
		categories,
		attributes,
		priceRange,
	}
}
