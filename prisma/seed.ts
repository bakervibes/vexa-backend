/**
 * Script de seed pour peupler la base de données avec des données initiales
 * Exécuter avec: pnpm db:seed
 */

import { faker } from '@faker-js/faker'
import {
	AddressType,
	categories,
	OrderStatus,
	PaymentProvider,
	PaymentStatus,
	Prisma,
	products,
	Role,
	users,
} from '@prisma/client'
import { prisma } from '../src/config'
import { toSlug } from '../src/utils/lib'
import { logger } from '../src/utils/logger'
import { hashPassword } from '../src/utils/password'

// Configuration
const CONFIG = {
	PRODUCTS_COUNT: 100,
	RANDOM_USERS_COUNT: 20,
	VARIANTS_PER_PRODUCT: 3,
	MIN_ORDERS_PER_USER: 1,
	MAX_ORDERS_PER_USER: 5,
	MIN_ITEMS_PER_ORDER: 1,
	MAX_ITEMS_PER_ORDER: 3,
}

const CATEGORIES = [
	{
		name: 'Électronique',
		sub: ['Smartphones', 'Ordinateurs', 'Audio', 'Accessoires'],
	},
	{ name: 'Jouets & Jeux' },
	{ name: 'Mode', sub: ['Hommes', 'Femmes', 'Enfants', 'Sport'] },
	{ name: 'Maison', sub: ['Décoration', 'Meubles', 'Cuisine', 'Jardin'] },
	{ name: 'Livres' },
	{ name: 'Sport & Loisirs', sub: ['Fitness', 'Randonnée', "Sports d'équipe"] },
	{ name: 'Beauté' },
	{ name: 'Automobile', sub: ['Pièces', 'Accessoires', 'Entretien'] },
	{ name: 'Alimentation' },
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

// Type pour les attributs avec options incluses
type AttributeWithOptions = Prisma.attributesGetPayload<{
	include: { options: true }
}>

async function cleanDatabase() {
	logger.info('🧹 Nettoyage de la base de données...')
	await prisma.order_items.deleteMany()
	await prisma.payments.deleteMany()
	await prisma.orders.deleteMany()
	await prisma.cart_items.deleteMany()
	await prisma.carts.deleteMany()
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

	// Créer l'admin séparément
	const admin = await prisma.users.create({
		data: {
			email: 'admin@vexa.com',
			password: hashedPassword,
			name: 'Admin Vexa',
			role: Role.ADMIN,
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
		phone: faker.phone.number(),
		image: faker.image.avatar(),
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
		image: faker.datatype.boolean({ probability: 0.7 }) ? faker.image.url() : null,
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
					name: sub,
					slug: toSlug(`${cat.name}-${sub}`),
					description: faker.commerce.productDescription(),
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

async function seedProducts(categories: categories[]): Promise<products[]> {
	logger.info(`📦 Création de ${CONFIG.PRODUCTS_COUNT} produits...`)

	const productsData = Array.from({ length: CONFIG.PRODUCTS_COUNT }, (_, i) => {
		const name = faker.commerce.productName()
		const hasVariants = faker.datatype.boolean({ probability: 0.5 })
		const hasDiscount = faker.datatype.boolean({ probability: 0.5 })
		const basePrice = !hasVariants ? parseFloat(faker.commerce.price({ min: 300, max: 500 })) : null
		const price =
			basePrice && hasDiscount
				? parseFloat(faker.commerce.price({ min: basePrice - 100, max: basePrice + 100 }))
				: null

		return {
			name,
			slug: toSlug(name),
			description: faker.commerce.productDescription(),
			basePrice,
			price,
			expiresAt: hasDiscount ? faker.date.future() : null,
			categoryId: faker.helpers.arrayElement(categories).id,
			isActive: true,
			images: Array.from({ length: 3 }, () => faker.image.url()),
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
	products: products[],
	attributes: AttributeWithOptions[]
): Promise<void> {
	logger.info('🔀 Création des variantes de produits...')

	let variantCount = 0

	for (const product of products) {
		// Créer des variantes uniquement pour les produits sans basePrice
		if (product.basePrice === null) {
			const variantsData = Array.from({ length: CONFIG.VARIANTS_PER_PRODUCT }, (_, j) => {
				const hasDiscount = faker.datatype.boolean({ probability: 0.5 })
				const basePrice = parseFloat(faker.commerce.price({ min: 300, max: 500 }))
				const price = hasDiscount
					? parseFloat(
							faker.commerce.price({
								min: basePrice - 100,
								max: basePrice + 100,
							})
						)
					: null

				return {
					productId: product.id,
					sku: `${faker.commerce.isbn()}-${j}`,
					basePrice,
					price,
					expiresAt: hasDiscount ? faker.date.future() : null,
					stock: faker.number.int({ min: 0, max: 100 }),
					isActive: true,
				}
			})

			const productVariants = await prisma.product_variants.createManyAndReturn({
				data: variantsData,
				skipDuplicates: true,
			})

			// Lier des options aléatoires aux variantes
			for (const variant of productVariants) {
				const variantOptionsData: {
					productId: string
					variantId: string
					optionId: string
				}[] = []

				for (const attribute of attributes) {
					if (faker.datatype.boolean({ probability: 0.7 }) && attribute.options.length > 0) {
						variantOptionsData.push({
							productId: product.id,
							variantId: variant.id,
							optionId: faker.helpers.arrayElement(attribute.options).id,
						})
					}
				}

				if (variantOptionsData.length > 0) {
					await prisma.product_variant_option.createMany({
						data: variantOptionsData,
						skipDuplicates: true,
					})
				}
			}

			variantCount += productVariants.length
		}
	}

	logger.success(`✓ ${variantCount} variantes créées`)
}

async function seedAddresses(users: users[]): Promise<void> {
	logger.info('🏠 Création des adresses...')

	const addresses = users.map((user) => ({
		userId: user.id,
		type: faker.helpers.arrayElement(Object.values(AddressType)),
		name: faker.datatype.boolean({ probability: 0.8 })
			? (user.name ?? faker.person.fullName())
			: faker.person.fullName(),
		street: faker.location.streetAddress(),
		city: faker.location.city(),
		postalCode: faker.datatype.boolean({ probability: 0.8 }) ? faker.location.zipCode() : null,
		country: faker.location.country(),
		phone: faker.phone.number({ style: 'international' }),
		isDefault: faker.datatype.boolean({ probability: 0.8 }),
	}))

	await prisma.addresses.createMany({
		data: addresses,
		skipDuplicates: true,
	})

	logger.success(`✓ ${addresses.length} adresses créées`)
}

async function seedOrdersAndPayments(users: users[], products: products[]): Promise<void> {
	logger.info('🛍️ Création des commandes et paiements...')

	let orderCount = 0

	for (const user of users) {
		const numOrders = faker.number.int({
			min: CONFIG.MIN_ORDERS_PER_USER,
			max: CONFIG.MAX_ORDERS_PER_USER,
		})

		for (let k = 0; k < numOrders; k++) {
			const orderItems: {
				productId: string
				variantId: string
				quantity: number
				price: number
				data: { name: string; sku: string }
			}[] = []
			let totalAmount = 0

			const itemCount = faker.number.int({
				min: CONFIG.MIN_ITEMS_PER_ORDER,
				max: CONFIG.MAX_ITEMS_PER_ORDER,
			})

			for (let m = 0; m < itemCount; m++) {
				const product = faker.helpers.arrayElement(products)
				const variant = await prisma.product_variants.findFirst({
					where: { productId: product.id },
				})

				if (variant) {
					const quantity = faker.number.int({ min: 1, max: 3 })
					const price = variant.price ?? variant.basePrice
					totalAmount += price * quantity

					orderItems.push({
						productId: product.id,
						variantId: variant.id,
						quantity,
						price,
						data: { name: product.name, sku: variant.sku },
					})
				}
			}

			if (orderItems.length > 0) {
				const order = await prisma.orders.create({
					data: {
						userId: user.id,
						orderNumber: faker.string.alphanumeric(10).toUpperCase(),
						status: faker.helpers.enumValue(OrderStatus),
						totalAmount,
						shippingAddress: {},
						billingAddress: {},
						items: {
							create: orderItems,
						},
					},
				})

				await prisma.payments.create({
					data: {
						orderId: order.id,
						provider: PaymentProvider.STRIPE,
						amount: totalAmount,
						status: PaymentStatus.COMPLETED,
						transactionId: faker.string.uuid(),
					},
				})

				orderCount++
			}
		}
	}

	logger.success(`✓ ${orderCount} commandes créées`)
}

async function seedReviews(users: users[], products: products[]): Promise<void> {
	logger.info('⭐ Création des avis produits...')

	const reviews = users
		.filter(() => faker.datatype.boolean({ probability: 0.6 }))
		.map((user) => {
			const product = faker.helpers.arrayElement(products)
			return {
				userId: user.id,
				productId: product.id,
				rating: faker.number.int({ min: 1, max: 5 }),
				comment: faker.lorem.sentence(),
				isApproved: true,
			}
		})

	const createdReviews = await prisma.product_reviews.createManyAndReturn({
		data: reviews,
		skipDuplicates: true,
	})

	logger.success(`✓ ${createdReviews.length} avis créés`)
}

async function main() {
	logger.info('🌱 Début du seed...\n')

	await cleanDatabase()

	// Seed dans l'ordre des dépendances
	const users = await seedUsers()
	const categories = await seedCategories()
	const attributes = await seedAttributesWithOptions()
	const products = await seedProducts(categories)
	await seedProductVariants(products, attributes)
	await seedAddresses(users)
	await seedOrdersAndPayments(users, products)
	await seedReviews(users, products)

	logger.success('\n✅ Seed terminé avec succès!')
}

main()
	.catch((error) => {
		logger.error('❌ Erreur lors du seed:', error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
