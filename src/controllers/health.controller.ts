import { prisma } from '../config/database'
import { config } from '../config/env'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Health check simple
 */

export const healthCheck = asyncHandler(async (_req, res) => {
	sendSuccess(
		res,
		{
			status: 'ok',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: config.env,
		},
		'Service opérationnel'
	)
})

/**
 * Vérification de la connexion à la base de données
 */
export const databaseCheck = asyncHandler(async (_req, res) => {
	const start = Date.now()

	// Test de connexion simple
	await prisma.$queryRaw`SELECT 1`

	const latency = Date.now() - start

	sendSuccess(
		res,
		{
			status: 'connected',
			latency: `${latency}ms`,
			timestamp: new Date().toISOString(),
		},
		'Base de données connectée'
	)
})
