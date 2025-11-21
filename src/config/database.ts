import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { logger } from '../utils/logger'
import { config } from './env'

/**
 * Pool de connexions PostgreSQL
 */
const pool = new Pool({
	connectionString: config.database.url,
	ssl: {
		rejectUnauthorized: false, // Accepte les certificats auto-signés (nécessaire pour Aiven et autres providers)
	},
})

/**
 * Adapter PostgreSQL pour Prisma v7
 */
const adapter = new PrismaPg(pool)

/**
 * Instance unique de Prisma Client avec gestion du singleton
 * Évite les connexions multiples en développement avec hot-reload
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
		errorFormat: 'pretty',
	})

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}

/**
 * Connexion à la base de données
 */
export const connectDatabase = async (): Promise<void> => {
	try {
		await prisma.$connect()
		logger.success('Connexion à la base de données établie')
	} catch (error) {
		logger.error('Erreur de connexion à la base de données:', error)
		process.exit(1)
	}
}

/**
 * Déconnexion de la base de données
 */
export const disconnectDatabase = async (): Promise<void> => {
	try {
		await prisma.$disconnect()
		logger.info('Déconnexion de la base de données réussie')
	} catch (error) {
		logger.error('Erreur lors de la déconnexion de la base de données:', error)
	}
}

/**
 * Handler pour arrêt propre
 */
process.on('beforeExit', async () => {
	await disconnectDatabase()
})
