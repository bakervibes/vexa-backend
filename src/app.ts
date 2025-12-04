import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Application } from 'express'
import express from 'express'
import 'express-async-errors' // Doit être importé tôt pour catch les erreurs async
import helmet from 'helmet'
import { connectDatabase } from './config/database'
import { config } from './config/env'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware'
import { generalLimiter } from './middlewares/rateLimiter.middleware'
import { requestLogger } from './middlewares/requestLogger.middleware'
import { logger } from './utils/logger'

// Import des routes
import addressRouter from './routes/addresses.route'
import authRouter from './routes/auth.routes'
import cartRouter from './routes/carts.route'
import categoriesRouter from './routes/categories.routes'
import couponRouter from './routes/coupons.route'
import filtersRouter from './routes/filters.routes'
import healthRouter from './routes/health.routes'
import orderRouter from './routes/orders.route'
import paymentRouter from './routes/payments.route'
import productsRouter from './routes/products.routes'
import reviewRouter from './routes/reviews.route'
import uploadthingRouter from './routes/uploadthing.route'
import userRouter from './routes/users.route'
import wishlistRouter from './routes/wishlists.route'
import { connectRedis } from './utils/redis'

/**
 * Crée et configure l'application Express
 */
export const createApp = (): Application => {
	const app: Application = express()

	// ============ Middlewares de sécurité ============

	// Helmet pour la sécurité des headers HTTP
	app.use(helmet())

	// CORS
	app.use(
		cors({
			origin: config.cors.origin,
			credentials: true,
		})
	)

	// Rate limiting général
	app.use(generalLimiter)

	// ============ Middlewares de parsing ============

	// Parse JSON
	app.use(express.json({ limit: '10mb' }))

	// Parse URL-encoded
	app.use(express.urlencoded({ extended: true, limit: '10mb' }))

	// Parse cookies
	app.use(cookieParser())

	// ============ Middlewares custom ============

	// Logger des requêtes
	if (config.isDevelopment) {
		app.use(requestLogger)
	}

	// ============ Routes ============

	// Health check
	app.use(`${config.server.apiPrefix}/health`, healthRouter)

	// Routes d'authentification
	app.use(`${config.server.apiPrefix}/auth`, authRouter)

	// Routes produits
	app.use(`${config.server.apiPrefix}/products`, productsRouter)

	// Routes catégories
	app.use(`${config.server.apiPrefix}/categories`, categoriesRouter)

	// Routes panier
	app.use(`${config.server.apiPrefix}/carts`, cartRouter)

	// Routes commandes
	app.use(`${config.server.apiPrefix}/orders`, orderRouter)

	// Routes avis
	app.use(`${config.server.apiPrefix}/reviews`, reviewRouter)

	// Routes paiements
	app.use(`${config.server.apiPrefix}/payments`, paymentRouter)

	// Routes wishlist
	app.use(`${config.server.apiPrefix}/wishlists`, wishlistRouter)

	// Routes coupons
	app.use(`${config.server.apiPrefix}/coupons`, couponRouter)

	// Routes addresses
	app.use(`${config.server.apiPrefix}/addresses`, addressRouter)

	// Routes filters (for shop filters: categories, attributes/options, price range)
	app.use(`${config.server.apiPrefix}/filters`, filtersRouter)

	// Routes users (profile management)
	app.use(`${config.server.apiPrefix}/users`, userRouter)

	// Routes uploadthing (file uploads)
	app.use(`${config.server.apiPrefix}/uploadthing`, uploadthingRouter)

	// ============ Gestion des erreurs ============

	// Route non trouvée (doit être après toutes les routes)
	app.use(notFoundHandler)

	// Gestionnaire d'erreurs global (doit être le dernier middleware)
	app.use(errorHandler)

	return app
}

/**
 * Démarre le serveur
 */
export const startServer = async (): Promise<void> => {
	try {
		// Connexion à la base de données
		await connectDatabase()

		// Connexion à Redis
		await connectRedis()

		// Créer l'application
		const app = createApp()

		// Démarrer le serveur
		const server = app.listen(config.server.port, () => {
			logger.success(`🚀 Serveur démarré avec succès!`)
			logger.info(`📍 Environment: ${config.env}`)
			logger.info(`🌐 URL: http://${config.server.host}:${config.server.port}`)
			logger.info(
				`📡 API: http://${config.server.host}:${config.server.port}${config.server.apiPrefix}`
			)
		})

		// Gestion propre de l'arrêt
		const gracefulShutdown = async (signal: string) => {
			logger.info(`\n${signal} reçu. Arrêt du serveur...`)

			server.close(async () => {
				logger.info('Serveur HTTP fermé')

				try {
					const { disconnectDatabase } = await import('./config/database')
					await disconnectDatabase()

					const { disconnectRedis } = await import('./utils/redis')
					await disconnectRedis()

					logger.success('Arrêt propre terminé')
					process.exit(0)
				} catch (error) {
					logger.error("Erreur lors de l'arrêt:", error)
					process.exit(1)
				}
			})

			// Forcer l'arrêt après 10 secondes
			setTimeout(() => {
				logger.error('Arrêt forcé après timeout')
				process.exit(1)
			}, 10000)
		}

		// Écouter les signaux d'arrêt
		process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
		process.on('SIGINT', () => gracefulShutdown('SIGINT'))
	} catch (error) {
		logger.error('Erreur lors du démarrage du serveur:', error)
		process.exit(1)
	}
}
