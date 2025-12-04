/**
 * Script de seed pour peupler la base de données avec des données initiales
 * Exécuter avec: pnpm db:seed
 */

import { faker } from '@faker-js/faker'
import {
	addresses,
	carts,
	categories,
	coupons,
	CouponType,
	OrderStatus,
	PaymentProvider,
	PaymentStatus,
	Prisma,
	product_reviews,
	products,
	ReviewLike,
	Role,
	users,
	wishlists,
} from '@prisma/client'
import { prisma } from '../src/config'
import { OrderItemData } from '../src/services/orders.service'
import { getAllCountries, getCitiesOfCountry } from '../src/utils/countries'
import { toSlug } from '../src/utils/lib'
import { logger } from '../src/utils/logger'
import { hashPassword } from '../src/utils/password'

// Type pour les attributs avec options incluses
type AttributeWithOptions = Prisma.attributesGetPayload<{
	include: { options: true }
}>

type ProductWithVariants = Prisma.productsGetPayload<{
	include: { variants: true }
}>

// Configuration
const CONFIG = {
	PRODUCTS_COUNT: 100,
	RANDOM_USERS_COUNT: 10,
	MIN_ATTRIBUTES_FOR_VARIANT: 1,
	MAX_ATTRIBUTES_FOR_VARIANT: 3,
	MIN_ITEMS_PER_CART: 10,
	MAX_ITEMS_PER_CART: 15,
	MIN_ITEMS_PER_WISHLIST: 10,
	MAX_ITEMS_PER_WISHLIST: 15,
	MIN_ORDERS_PER_USER: 10,
	MAX_ORDERS_PER_USER: 15,
	MIN_ITEMS_PER_ORDER: 6,
	MAX_ITEMS_PER_ORDER: 10,
	MIN_REVIEWS_PER_USER: 2,
	MAX_REVIEWS_PER_USER: 10,
}

const productImages = [
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cVAXSADA4S9GiwopEMON57DlHAya26enKQRbC',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cdgTW4VGrLwHxFOeGnmMfDB9AqYRjgIub12k8',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9couevHkdtdUXCJT2oeg4W5fSKxz1DniAkFcLI',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cEvKylOHg5IMdfUiKR2DWwnkBNzjQFLtxT1AJ',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cj4UE7gOjJ6aZ7XD3fNk0pKEWVnIw1yuFxAPg',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cPBsq7CwArcMCTWi7fKmeb5DNo12haJnXt4Pj',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9c7ulSYysZEAeOtS3yXnWG9kZjhMHP7xrBJz6U',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cQ3sZyDjSueNvmrVZnd8COF0IoiKbYDWTw3Xf',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9ca5s8G0tIsPh1B2H9DZFdXU0omgyRNvEei4LV',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cGtqhYBiku0Ntjry9TW52wHUnvqSYOa4hsZEB',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cKBoaZF6eftwixq8E1gNBCZIk7aPG3lOcAKv6',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cEfL3jiHg5IMdfUiKR2DWwnkBNzjQFLtxT1AJ',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cjh85CEOjJ6aZ7XD3fNk0pKEWVnIw1yuFxAPg',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cIf7bM5ul1giesINhw3pPQRnXW9TmSybuvGE7',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9c89N7IGLMQLRbCeUHfnA6myhgjcdN3DGFKz1o',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cganLKsJc3DAZalX0uGVWpTHhsKtEPbkfoB7i',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cCtr1su5kEqF3Jy27gHjYZRIKueUMTLrPbQ96',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cHUaudKyiUzPu95M1B2VQoYaGWOFy3wClRp6m',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cwUmBfWvArL3ZDz8GEuxCOd5aUQK2IYlN4pH6',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9cXM4ceeRuBElR1zCoykf2DcMHA5Lir4Ges9JP',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9crnBlEhSeiFx4abZD0uWRB7lkpEsoHdqMy6rw',
	'https://vphrj1hqae.ufs.sh/f/FAWtdWKxGe9c7S5Y0QZEAeOtS3yXnWG9kZjhMHP7xrBJz6UF',
]

const CATEGORIES = [
	{
		name: 'Électronique',
		sub: [
			{
				name: 'Smartphones',
				image: '/categories/smartphones.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Ordinateurs',
				image: '/categories/ordinateurs.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Audio',
				image: '/categories/audio.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Accessoires',
				image: '/categories/accessoires.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
		],
		image: '/categories/electronique.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Jouets & Jeux',
		image: '/categories/jouets.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Mode',
		sub: [
			{
				name: 'Hommes',
				image: '/categories/hommes.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Femmes',
				image: '/categories/femmes.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Enfants',
				image: '/categories/enfants.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
		],
		image: '/categories/mode.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Maison',
		sub: [
			{
				name: 'Décoration',
				image: '/categories/decoration.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Meubles',
				image: '/categories/meubles.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Cuisine',
				image: '/categories/cuisine.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Jardin',
				image: '/categories/jardin.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
		],
		image: '/categories/maison.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Livres',
		image: '/categories/livres.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Sport & Loisirs',
		sub: [
			{
				name: 'Fitness',
				image: '/categories/fitness.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Randonnée',
				image: '/categories/randonnee.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: "Sports d'équipe",
				image: '/categories/sports-d-equipe.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
		],
		image: '/categories/sport.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Beauté',
		image: '/categories/beaute.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Automobile',
		sub: [
			{
				name: 'Pièces',
				image: '/categories/pieces.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Accessoires auto',
				image: '/categories/accessoires-auto.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
			{
				name: 'Entretien',
				image: '/categories/entretien.png',
				position: {
					x: faker.helpers.arrayElement([0, 1]),
					y: faker.helpers.arrayElement([0, 1]),
				},
			},
		],
		image: '/categories/automobile.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
	{
		name: 'Alimentation',
		image: '/categories/alimentation.png',
		position: {
			x: faker.helpers.arrayElement([0, 1]),
			y: faker.helpers.arrayElement([0, 1]),
		},
	},
]

const ATTRIBUTES = [
	{
		name: 'Couleur',
		options: ['Rouge', 'Bleu', 'Noir', 'Blanc', 'Vert', 'Jaune', 'Rose', 'Gris'],
	},
	{ name: 'Taille', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
	{
		name: 'Matériau',
		options: ['Coton', 'Polyester', 'Cuir', 'Métal', 'Bois', 'Verre', 'Plastique'],
	},
	{
		name: 'Marque',
		options: ['Nike', 'Adidas', 'Samsung', 'Apple', 'Sony', "L'Oréal", 'Ikea'],
	},
	{ name: 'Poids', options: ['<1kg', '1-5kg', '5-10kg', '>10kg'] },
	{ name: 'Capacité', options: ['32GB', '64GB', '128GB', '256GB', '512GB'] },
	{ name: 'Énergie', options: ['Électrique', 'Batterie', 'Manuelle'] },
	{
		name: 'Style',
		options: ['Moderne', 'Classique', 'Vintage', 'Sport', 'Casual'],
	},
]

// Fonction pour générer toutes les combinaisons d'options
function generateCombinations(attributesWithOptions: AttributeWithOptions[]): string[][] {
	if (attributesWithOptions.length === 0) return [[]]

	const [firstAttribute, ...restAttributes] = attributesWithOptions
	const restCombinations = generateCombinations(restAttributes)
	const allCombinations: string[][] = []

	for (const option of firstAttribute.options) {
		for (const combination of restCombinations) {
			allCombinations.push([option.id, ...combination])
		}
	}

	return allCombinations
}

async function cleanDatabase() {
	logger.info('🧹 Nettoyage de la base de données...')
	await prisma.order_items.deleteMany()
	await prisma.payments.deleteMany()
	await prisma.orders.deleteMany()
	await prisma.cart_items.deleteMany()
	await prisma.carts.deleteMany()
	await prisma.wishlist_items.deleteMany()
	await prisma.wishlists.deleteMany()
	await prisma.coupons.deleteMany()
	await prisma.product_reviews.deleteMany()
	await prisma.product_variant_option.deleteMany()
	await prisma.product_variants.deleteMany()
	await prisma.products.deleteMany()
	await prisma.options.deleteMany()
	await prisma.attributes.deleteMany()
	await prisma.categories.deleteMany()
	await prisma.addresses.deleteMany()
	await prisma.users.deleteMany()
	logger.success('✓ Base de données nettoyée')
}

async function seedUsers(): Promise<users[]> {
	logger.info(`👥 Création de ${CONFIG.RANDOM_USERS_COUNT} utilisateurs aléatoires...`)

	const hashedPassword = await hashPassword('#Baker08')

	// Créer l'admin séparémentAdmin Vexa
	const admin = await prisma.users.create({
		data: {
			id: 'cmietd9g30000i4almc0gqvmp',
			name: 'Baker',
			email: 'godobriand08@gmail.com',
			password: hashedPassword,
			role: Role.ADMIN,
			phone: '+2290166386436',
			image: faker.image.avatar(),
			isActive: true,
			emailVerified: new Date(),
		},
	})

	// Créer les utilisateurs normaux
	const usersData = Array.from({ length: CONFIG.RANDOM_USERS_COUNT }, () => ({
		name: faker.person.fullName(),
		email: faker.internet.email(),
		password: hashedPassword,
		role: Role.USER,
		phone: '+2290166386436',
		image: faker.image.avatar(),
		isActive: true,
		emailVerified: faker.date.past(),
	}))

	const createdUsers = await prisma.users.createManyAndReturn({
		data: usersData,
		skipDuplicates: true,
	})

	const allUsers = [admin, ...createdUsers]
	logger.success(`✓ ${allUsers.length} utilisateurs créés`)
	return allUsers
}

async function seedCategories(): Promise<categories[]> {
	logger.info('📂 Création des catégories...')

	const createdCategories: categories[] = []

	// Créer les catégories parentes d'abord
	const parentData = CATEGORIES.map((cat) => ({
		name: cat.name,
		slug: toSlug(cat.name),
		description: faker.datatype.boolean({ probability: 0.7 })
			? faker.lorem.sentences({ min: 2, max: 4 })
			: null,
		image: cat.image,
		position: cat.position,
		isActive: true,
	}))

	const createdParents = await prisma.categories.createManyAndReturn({
		data: parentData,
		skipDuplicates: true,
	})

	createdCategories.push(...createdParents)

	// Créer les sous-catégories avec référence aux parents
	for (const cat of CATEGORIES) {
		if (cat.sub) {
			const parent = createdCategories.find((c) => c.name === cat.name)

			if (parent) {
				const subData = cat.sub.map((sub) => ({
					name: sub.name,
					slug: toSlug(`${cat.name}-${sub.name}`),
					description: faker.lorem.sentences({ min: 3, max: 5 }),
					image: sub.image,
					position: sub.position,
					parentId: parent.id,
					isActive: true,
				}))

				const subCategories = await prisma.categories.createManyAndReturn({
					data: subData,
					skipDuplicates: true,
				})

				createdCategories.push(...subCategories)
			}
		}
	}

	logger.success(`✓ ${createdCategories.length} catégories créées`)
	return createdCategories
}

async function seedAttributesWithOptions(): Promise<AttributeWithOptions[]> {
	logger.info('🎨 Création des attributs et options...')

	const createdAttributes: AttributeWithOptions[] = []

	for (const attr of ATTRIBUTES) {
		const attribute = await prisma.attributes.create({
			data: {
				name: attr.name,
				slug: toSlug(attr.name),
				isActive: true,
				options: {
					create: attr.options.map((optName) => ({
						name: optName,
						slug: toSlug(`${attr.name}-${optName}`),
						isActive: true,
					})),
				},
			},
			include: { options: true },
		})

		createdAttributes.push(attribute)
	}

	logger.success(`✓ ${createdAttributes.length} attributs et leurs options créés`)
	return createdAttributes
}

async function seedProducts(createdCategories: categories[]): Promise<products[]> {
	logger.info(`📦 Création de ${CONFIG.PRODUCTS_COUNT} produits...`)

	const productsData = Array.from({ length: CONFIG.PRODUCTS_COUNT }, () => {
		const name = faker.commerce.productName()
		const hasVariants = faker.datatype.boolean({ probability: 0.5 })
		const hasDiscount = faker.datatype.boolean({ probability: 0.8 })
		const basePrice = !hasVariants ? parseFloat(faker.commerce.price({ min: 300, max: 500 })) : null
		const price =
			basePrice && hasDiscount
				? parseFloat(faker.commerce.price({ min: basePrice - 100, max: basePrice + 100 }))
				: null
		const isRecent = faker.datatype.boolean({ probability: 0.5 })

		return {
			name,
			slug: toSlug(name),
			description: faker.lorem.sentences({ min: 2, max: 4 }),
			sku: faker.commerce.isbn(),
			basePrice,
			price,
			stock: hasVariants ? 0 : faker.number.int({ min: 0, max: 100 }),
			expiresAt: hasDiscount ? faker.date.future() : null,
			categoryId: faker.helpers.arrayElement(createdCategories).id,
			isActive: true,
			images: faker.helpers.arrayElements(productImages, 3),
			createdAt: isRecent ? faker.date.recent() : faker.date.past(),
		}
	})

	const createdProducts = await prisma.products.createManyAndReturn({
		data: productsData,
		skipDuplicates: true,
	})

	logger.success(`✓ ${createdProducts.length} produits créés`)
	return createdProducts
}

async function seedProductVariants(
	createdProducts: products[],
	createdAttributes: AttributeWithOptions[]
): Promise<ProductWithVariants[]> {
	logger.info('🔀 Création des variantes de produits...')

	const createdProductVariants: ProductWithVariants[] = []
	const filteredProducts = createdProducts.filter((product) => product.basePrice === null)

	for (const product of filteredProducts) {
		const numAttributes = faker.number.int({
			min: CONFIG.MIN_ATTRIBUTES_FOR_VARIANT,
			max: Math.min(CONFIG.MAX_ATTRIBUTES_FOR_VARIANT, createdAttributes.length),
		})

		// Sélectionner les attributs aléatoirement
		const selectedAttributes = faker.helpers.arrayElements(createdAttributes, numAttributes)

		// Générer toutes les combinaisons possibles d'options
		const combinations = generateCombinations(selectedAttributes)

		// Créer une variante pour chaque combinaison
		const variants = await Promise.all(
			combinations.map(async (combinaison, j) => {
				const basePrice = parseFloat(faker.commerce.price({ min: 300, max: 500 }))
				const hasDiscount = faker.datatype.boolean({ probability: 0.5 })

				// Si discount, le prix doit être INFÉRIEUR au basePrice
				const price = hasDiscount
					? parseFloat(
							faker.commerce.price({
								min: basePrice * 0.7, // 30% de réduction max
								max: basePrice * 0.95, // 5% de réduction min
							})
						)
					: null

				return prisma.product_variants.create({
					data: {
						productId: product.id,
						sku: `${faker.commerce.isbn()}-${j}`,
						basePrice,
						price,
						expiresAt: hasDiscount ? faker.date.future() : null,
						stock: faker.number.int({ min: 0, max: 100 }),
						isActive: true,
						productVariantOptions: {
							create: combinaison.map((optionId) => ({
								optionId,
							})),
						},
					},
				})
			})
		)

		// Mettre à jour le stock total du produit
		await prisma.products.update({
			where: { id: product.id },
			data: {
				stock: variants.reduce((acc, variant) => acc + variant.stock, 0),
			},
		})

		createdProductVariants.push({ ...product, variants })
	}

	logger.success(`✓ ${createdProductVariants.length} variantes créées`)
	return createdProductVariants
}

async function seedCarts(
	createdUsers: users[],
	createdProducts: ProductWithVariants[]
): Promise<void> {
	logger.info('🛒 Création des paniers...')

	const carts: carts[] = []

	for (const user of createdUsers) {
		const cart = await prisma.carts.create({
			data: {
				userId: user.id,
				sessionId:
					user.id === 'cmietd9g30000i4almc0gqvmp' ? '5552dda6-9d16-4162-a964-4faf28ff0123' : null,
			},
		})

		carts.push(cart)

		const items = faker.helpers.arrayElements(
			createdProducts,
			faker.number.int({ min: CONFIG.MIN_ITEMS_PER_CART, max: CONFIG.MAX_ITEMS_PER_CART })
		)

		for (const item of items) {
			const hasVariant = item.variants.length > 0

			await prisma.cart_items.create({
				data: {
					cartId: cart.id,
					productId: item.id,
					variantId: hasVariant ? faker.helpers.arrayElement(item.variants).id : null,
					quantity: faker.number.int({ min: 1, max: 15 }),
				},
			})
		}
	}

	logger.success(`✓ ${carts.length} paniers créés`)
}

async function seedWishlists(
	createdUsers: users[],
	createdProducts: ProductWithVariants[]
): Promise<void> {
	logger.info('🛒 Création des listes de souhaits...')

	const wishlists: wishlists[] = []

	for (const user of createdUsers) {
		const wishlist = await prisma.wishlists.create({
			data: {
				userId: user.id,
				sessionId:
					user.id === 'cmietd9g30000i4almc0gqvmp' ? '5552dda6-9d16-4162-a964-4faf28ff0123' : null,
			},
		})

		wishlists.push(wishlist)

		const items = faker.helpers.arrayElements(
			createdProducts,
			faker.number.int({ min: CONFIG.MIN_ITEMS_PER_WISHLIST, max: CONFIG.MAX_ITEMS_PER_WISHLIST })
		)

		for (const item of items) {
			const hasVariant = item.variants.length > 0

			await prisma.wishlist_items.create({
				data: {
					wishlistId: wishlist.id,
					productId: item.id,
					variantId: hasVariant ? faker.helpers.arrayElement(item.variants).id : null,
				},
			})
		}
	}

	logger.success(`✓ ${wishlists.length} listes de souhaits créées`)
}

async function seedCoupons(): Promise<void> {
	logger.info('🎁 Création des coupons...')

	const coupons: coupons[] = []

	for (let i = 0; i < 100; i++) {
		const canExpire = faker.datatype.boolean({ probability: 0.5 })
		const inFuture = faker.datatype.boolean({ probability: 0.5 })

		const coupon = await prisma.coupons.create({
			data: {
				code: faker.string.alphanumeric(10).toUpperCase(),
				value: parseFloat(faker.commerce.price({ min: 1, max: 100 })),
				type: faker.helpers.enumValue(CouponType),
				usageLimit: faker.number.int({ min: 1, max: 100 }),
				expiresAt: canExpire ? (inFuture ? faker.date.future() : faker.date.past()) : null,
				isActive: !canExpire || (canExpire && inFuture),
			},
		})

		coupons.push(coupon)
	}

	logger.success(`✓ ${coupons.length} coupons créés`)
}

async function seedAddresses(createdUsers: users[]): Promise<addresses[]> {
	logger.info('🏠 Création des adresses...')

	const addresses: addresses[] = []

	// Filtrer les pays qui ont des villes disponibles
	const allCountries = getAllCountries()
	const countriesWithCities = allCountries.filter((country) => {
		const cities = getCitiesOfCountry(country.code)
		return cities.length > 0
	})

	if (countriesWithCities.length === 0) {
		logger.warn('⚠️ Aucun pays avec des villes disponibles, utilisation de villes générées')
	}

	// Fonction helper pour obtenir une ville valide
	const getRandomCity = (countryCode: string): string => {
		const cities = getCitiesOfCountry(countryCode)
		if (cities.length > 0) {
			return faker.helpers.arrayElement(cities).name
		}
		// Fallback: générer un nom de ville aléatoire
		return faker.location.city()
	}

	for (const user of createdUsers) {
		// Créer une adresse par défaut pour chaque user
		const defaultCountry =
			countriesWithCities.length > 0
				? faker.helpers.arrayElement(countriesWithCities)
				: faker.helpers.arrayElement(allCountries)

		const defaultAddress = await prisma.addresses.create({
			data: {
				userId: user.id,
				name: user.name ?? faker.person.fullName(),
				email: user.email ?? faker.internet.email(),
				street: faker.location.streetAddress(),
				city: getRandomCity(defaultCountry.code),
				country: defaultCountry.name,
				phone: '+2290166386436',
				isDefault: true,
			},
		})

		addresses.push(defaultAddress)

		// Créer entre 1 et 3 adresses supplémentaires non-default
		const extraCount = faker.number.int({ min: 1, max: 3 })
		for (let i = 0; i < extraCount; i++) {
			const country =
				countriesWithCities.length > 0
					? faker.helpers.arrayElement(countriesWithCities)
					: faker.helpers.arrayElement(allCountries)

			const extraAddress = await prisma.addresses.create({
				data: {
					userId: user.id,
					name: faker.person.fullName(),
					email: faker.internet.email(),
					street: faker.location.streetAddress(),
					city: getRandomCity(country.code),
					country: country.name,
					phone: '+2290166386436',
					isDefault: false,
				},
			})

			addresses.push(extraAddress)
		}
	}
	logger.success(`✓ ${addresses.length} adresses créées`)
	return addresses
}

async function seedOrdersAndPayments(
	createdUsers: users[],
	createdProducts: products[],
	createdAddresses: addresses[]
): Promise<void> {
	logger.info('🛍️ Création des commandes et paiements...')
	let orderCount = 0

	// Pour garantir que chaque produit a plusieurs achats
	const productPurchaseCount = new Map<string, number>()

	for (const user of createdUsers) {
		const addresses = createdAddresses.filter((address) => address.userId === user.id)

		const numOrders = faker.number.int({
			min: CONFIG.MIN_ORDERS_PER_USER,
			max: CONFIG.MAX_ORDERS_PER_USER,
		})

		for (let k = 0; k < numOrders; k++) {
			const orderItems: {
				name: string
				sku: string
				quantity: number
				price: number
				image: string
				variant: { sku: string; options: { attribute: string; option: string }[] } | null
			}[] = []
			let totalAmount = 0

			const itemCount = faker.number.int({
				min: CONFIG.MIN_ITEMS_PER_ORDER,
				max: CONFIG.MAX_ITEMS_PER_ORDER,
			})

			for (let m = 0; m < itemCount; m++) {
				const product = faker.helpers.arrayElement(createdProducts)

				// Suivre le nombre d'achats par produit
				productPurchaseCount.set(product.id, (productPurchaseCount.get(product.id) || 0) + 1)

				const variant = await prisma.product_variants.findFirst({
					where: { productId: product.id },
					include: {
						productVariantOptions: {
							include: { option: { include: { attribute: true } } },
						},
					},
				})

				const quantity = faker.number.int({ min: 1, max: 3 })
				const price =
					variant?.price ?? variant?.basePrice ?? product.price ?? product.basePrice ?? 0
				totalAmount += price * quantity

				orderItems.push({
					name: product.name,
					sku: product.sku,
					quantity,
					price,
					image: product.images[0],
					variant: variant
						? {
								sku: variant.sku,
								options: variant.productVariantOptions.map((option) => ({
									attribute: option.option.attribute.name,
									option: option.option.name,
								})),
							}
						: null,
				})
			}

			if (orderItems.length > 0) {
				await prisma.orders.create({
					data: {
						userId: user.id,
						addressId: faker.helpers.arrayElement(addresses).id,
						orderNumber: faker.string.alphanumeric(10).toUpperCase(),
						status: faker.helpers.enumValue(OrderStatus),
						totalAmount,
						items: {
							create: orderItems.map((item) => ({ data: item })),
						},
						shippingCost: 0,
						payments: {
							create: {
								provider: faker.helpers.enumValue(PaymentProvider),
								amount: totalAmount,
								status: faker.helpers.enumValue(PaymentStatus),
								transactionId: faker.string.uuid(),
							},
						},
					},
				})
				orderCount++
			}
		}
	}

	logger.success(`✓ ${orderCount} commandes créées`)
	logger.info(`📊 Répartition: ${productPurchaseCount.size} produits différents achetés`)
}

async function seedReviews(createdProducts: products[]): Promise<product_reviews[]> {
	logger.info('⭐ Création des avis produits basés sur les achats...')

	const allOrderItems = await prisma.order_items.findMany({
		include: {
			order: {
				select: { userId: true },
			},
		},
	})

	// Grouper les achats par produit et utilisateur
	const productBuyers = new Map<string, Set<string>>()

	for (const item of allOrderItems) {
		const itemData = item.data as unknown as OrderItemData

		// Trouver le produit correspondant
		const product = createdProducts.find((p) => p.sku === itemData.sku)
		if (!product) continue

		if (!productBuyers.has(product.id)) {
			productBuyers.set(product.id, new Set())
		}
		productBuyers.get(product.id)!.add(item.order.userId)
	}

	const reviewsData: Prisma.product_reviewsCreateManyInput[] = []

	for (const product of createdProducts) {
		const buyers = productBuyers.get(product.id)

		if (!buyers || buyers.size === 0) continue

		// Chaque acheteur peut laisser entre 1 et 4 avis
		for (const userId of buyers) {
			const reviewCount = faker.number.int({
				min: CONFIG.MIN_REVIEWS_PER_USER,
				max: CONFIG.MAX_REVIEWS_PER_USER,
			})

			for (let i = 0; i < reviewCount; i++) {
				reviewsData.push({
					userId: userId,
					productId: product.id,
					rating: faker.number.int({ min: 1, max: 5 }),
					comment: faker.lorem.sentences({ min: 2, max: 6 }),
					isApproved: true,
					createdAt: faker.date.recent(),
				})
			}
		}
	}

	const createdReviews = await prisma.product_reviews.createManyAndReturn({
		data: reviewsData,
		skipDuplicates: true,
	})

	logger.success(`✓ ${createdReviews.length} avis créés (${productBuyers.size} produits avec avis)`)
	return createdReviews
}

async function seedReviewLikes(
	createdUsers: users[],
	createdReviews: product_reviews[]
): Promise<void> {
	logger.info('👍 Création des likes sur les avis...')

	if (createdReviews.length === 0) {
		logger.warn('⚠️ Aucun avis trouvé, skip des likes')
		return
	}

	const likesData: Prisma.product_review_likesCreateManyInput[] = []

	for (const user of createdUsers) {
		// Chaque utilisateur like/dislike entre 10% et 40% des avis
		const numLikes = faker.number.int({
			min: Math.floor(createdReviews.length * 0.1),
			max: Math.floor(createdReviews.length * 0.4),
		})

		// Sélectionner aléatoirement des avis
		const reviewsToLike = faker.helpers.arrayElements(createdReviews, numLikes)

		for (const review of reviewsToLike) {
			// Un utilisateur ne peut pas liker son propre avis
			if (review.userId === user.id) continue

			likesData.push({
				reviewId: review.id,
				userId: user.id,
				type: faker.helpers.enumValue(ReviewLike),
				createdAt: faker.date.between({ from: review.createdAt, to: new Date() }),
			})
		}
	}

	const createdLikes = await prisma.product_review_likes.createManyAndReturn({
		data: likesData,
		skipDuplicates: true,
	})

	logger.success(`✓ ${createdLikes.length} likes/dislikes créés`)
}

async function main() {
	logger.info('🌱 Début du seed...\n')

	await cleanDatabase()

	// Seed dans l'ordre des dépendances
	const createdUsers = await seedUsers()
	const createdCategories = await seedCategories()
	const createdAttributes = await seedAttributesWithOptions()
	const createdProducts = await seedProducts(createdCategories)
	const createdProductVariants = await seedProductVariants(createdProducts, createdAttributes)
	await seedCarts(createdUsers, createdProductVariants)
	await seedWishlists(createdUsers, createdProductVariants)
	await seedCoupons()
	const createdAddresses = await seedAddresses(createdUsers)
	await seedOrdersAndPayments(createdUsers, createdProducts, createdAddresses)
	const createdReviews = await seedReviews(createdProducts)
	await seedReviewLikes(createdUsers, createdReviews)
	logger.success('\n✅ Seed terminé avec succès!')
}

main()
	.catch((error) => {
		logger.error('❌ Erreur lors du seed:', error)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
