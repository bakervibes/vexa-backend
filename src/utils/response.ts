import { Response } from 'express'

/**
 * Format de réponse API standardisé
 */
export interface ApiResponse<T = any> {
	success: boolean
	message: string
	data?: T
	error?: {
		code: string
		details?: any
	}
	timestamp: string
}

/**
 * Helper pour envoyer des réponses success standardisées
 */
export const sendSuccess = <T>(
	res: Response,
	data: T,
	message: string = 'Succès',
	statusCode: number = 200
): Response => {
	const response: ApiResponse<T> = {
		success: true,
		message,
		data,
		timestamp: new Date().toISOString()
	}

	return res.status(statusCode).json(response)
}

/**
 * Helper pour envoyer des réponses error standardisées
 */
export const sendError = (
	res: Response,
	message: string,
	statusCode: number = 500,
	code: string = 'INTERNAL_ERROR',
	details?: any
): Response => {
	const response: ApiResponse = {
		success: false,
		message,
		error: {
			code,
			details
		},
		timestamp: new Date().toISOString()
	}

	return res.status(statusCode).json(response)
}
