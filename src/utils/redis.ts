import type { RedisClientType } from 'redis'
import { createClient } from 'redis'
import { config } from '../config/env'
import { logger } from './logger'

// Create Redis client
const redis: RedisClientType = createClient({
	url: config.redis.url,
})

// Error handling
redis.on('error', (err) => {
	logger.error('Redis Error:', err)
})

redis.on('connect', () => {
	logger.info('Redis client connected')
})

redis.on('ready', () => {
	logger.success('Redis client ready')
})

redis.on('reconnecting', () => {
	logger.warn('Redis client reconnecting...')
})

redis.on('end', () => {
	logger.info('Redis client disconnected')
})

/**
 * Connect to Redis
 */
async function connectRedis(): Promise<void> {
	try {
		if (!redis.isOpen) {
			await redis.connect()
			logger.success('✅ Redis connected successfully')
		}
	} catch (error) {
		logger.error('Failed to connect to Redis:', error)
		throw error
	}
}

/**
 * Disconnect from Redis
 */
async function disconnectRedis(): Promise<void> {
	try {
		if (redis.isOpen) {
			await redis.quit()
			logger.info('Redis connection closed')
		}
	} catch (error) {
		logger.error('Error disconnecting from Redis:', error)
		throw error
	}
}

export { connectRedis, disconnectRedis, redis }
