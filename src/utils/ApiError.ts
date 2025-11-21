/**
 * Classe de base pour les erreurs API personnalisées
 */
export class ApiError extends Error {
	public readonly statusCode: number
	public readonly isOperational: boolean
	public readonly details?: any

	constructor(
		statusCode: number,
		message: string,
		isOperational: boolean = true,
		details?: any,
		stack: string = ''
	) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = isOperational
		this.details = details

		if (stack) {
			this.stack = stack
		} else {
			Error.captureStackTrace(this, this.constructor)
		}
	}
}

/**
 * Erreur 400 - Bad Request
 */
export class BadRequestError extends ApiError {
	constructor(message: string = 'Requête invalide', details?: any) {
		super(400, message, true, details)
	}
}

/**
 * Erreur 401 - Unauthorized
 */
export class UnauthorizedError extends ApiError {
	constructor(message: string = 'Non authentifié', details?: any) {
		super(401, message, true, details)
	}
}

/**
 * Erreur 403 - Forbidden
 */
export class ForbiddenError extends ApiError {
	constructor(message: string = 'Accès refusé', details?: any) {
		super(403, message, true, details)
	}
}

/**
 * Erreur 404 - Not Found
 */
export class NotFoundError extends ApiError {
	constructor(message: string = 'Ressource non trouvée', details?: any) {
		super(404, message, true, details)
	}
}

/**
 * Erreur 409 - Conflict
 */
export class ConflictError extends ApiError {
	constructor(message: string = 'Conflit de ressource', details?: any) {
		super(409, message, true, details)
	}
}

/**
 * Erreur 422 - Unprocessable Entity
 */
export class ValidationError extends ApiError {
	constructor(message: string = 'Erreur de validation', details?: any) {
		super(422, message, true, details)
	}
}

/**
 * Erreur 429 - Too Many Requests
 */
export class TooManyRequestsError extends ApiError {
	constructor(message: string = 'Trop de requêtes', details?: any) {
		super(429, message, true, details)
	}
}

/**
 * Erreur 500 - Internal Server Error
 */
export class InternalServerError extends ApiError {
	constructor(message: string = 'Erreur interne du serveur', details?: any) {
		super(500, message, false, details)
	}
}

/**
 * Erreur 503 - Service Unavailable
 */
export class ServiceUnavailableError extends ApiError {
	constructor(message: string = 'Service indisponible', details?: any) {
		super(503, message, false, details)
	}
}
