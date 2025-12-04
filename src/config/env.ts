import dotenv from 'dotenv'
import { z } from 'zod'
import { logger } from '../utils/logger'

// Charger les variables d'environnement
dotenv.config()

/**
 * Schéma de validation des variables d'environnement
 */
const envSchema = z.object({
	// Environnement
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	// Serveur
	PORT: z.string().default('3000').transform(Number).pipe(z.number().min(1).max(65535)),
	HOST: z.string().default('localhost'),

	// Base de données
	DATABASE_URL: z.url('DATABASE_URL doit être une URL valide'),

	// Redis
	REDIS_URL: z.string().default('redis://localhost:6379'),

	// JWT
	JWT_SECRET: z.string().min(32, 'JWT_SECRET doit contenir au moins 32 caractères'),
	JWT_EXPIRES_IN: z.string().default('7d'),
	JWT_REFRESH_SECRET: z
		.string()
		.min(32, 'JWT_REFRESH_SECRET doit contenir au moins 32 caractères')
		.optional(),
	JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

	// CORS
	CORS_ORIGIN: z.string().default('*'),

	// Rate Limiting
	RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number).pipe(z.number().positive()), // 15 minutes
	RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number).pipe(z.number().positive()),

	// Autres
	API_PREFIX: z.string().default('/api'),
	LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

	// UploadThing
	UPLOADTHING_TOKEN: z.string().min(1, 'UPLOADTHING_TOKEN doit contenir au moins 1 caractère'),
})

/**
 * Validation et export des variables d'environnement
 */
const validateEnv = () => {
	try {
		const env = envSchema.parse(process.env)
		logger.success("Variables d'environnement validées avec succès")
		return env
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error("Erreur de validation des variables d'environnement:", {
				errors: error.issues.map((err: z.ZodIssue) => ({
					path: err.path.join('.'),
					message: err.message,
				})),
			})
		}
		process.exit(1)
	}
}

export const env = validateEnv()

/**
 * Configuration de l'application
 */
export const config = {
	env: env.NODE_ENV,
	isDevelopment: env.NODE_ENV === 'development',
	isProduction: env.NODE_ENV === 'production',
	isTest: env.NODE_ENV === 'test',

	server: {
		port: env.PORT,
		host: env.HOST,
		apiPrefix: env.API_PREFIX,
	},

	database: {
		url: env.DATABASE_URL,
	},

	redis: {
		url: env.REDIS_URL,
	},

	jwt: {
		secret: env.JWT_SECRET,
		expiresIn: env.JWT_EXPIRES_IN,
		refreshSecret: env.JWT_REFRESH_SECRET,
		refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
	},

	cors: {
		origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
	},

	rateLimit: {
		windowMs: env.RATE_LIMIT_WINDOW_MS,
		maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
	},

	log: {
		level: env.LOG_LEVEL,
	},

	uploadthing: {
		token: env.UPLOADTHING_TOKEN,
	},
} as const
