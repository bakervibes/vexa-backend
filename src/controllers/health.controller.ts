import { prisma } from '../config/database'
import { config } from '../config/env'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

/**
 * Simple health check
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
		'Service operational'
	)
})

/**
 * Database connection check
 */
export const databaseCheck = asyncHandler(async (_req, res) => {
	const start = Date.now()

	// Simple connection test
	await prisma.$queryRaw`SELECT 1`

	const latency = Date.now() - start

	sendSuccess(
		res,
		{
			status: 'connected',
			latency: `${latency}ms`,
			timestamp: new Date().toISOString(),
		},
		'Database connected'
	)
})
