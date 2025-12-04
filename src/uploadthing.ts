// upload-router.ts
import type { Request } from 'express'
import jwt from 'jsonwebtoken'
import type { FileRouter } from 'uploadthing/express'
import { createUploadthing } from 'uploadthing/express'
import { prisma } from './config/database'
import { env } from './config/env'
import { UnauthorizedError } from './utils/ApiError'

interface JwtPayload {
	userId: string
	iat: number
	exp: number
}

const f = createUploadthing()

/**
 * Helper function to verify JWT token and get user
 */
async function getUserFromRequest(req: Request) {
	const authHeader = req.headers?.authorization

	if (!authHeader?.startsWith('Bearer ')) {
		return null
	}

	const token = authHeader.split(' ')[1]
	if (!token) {
		return null
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
		const user = await prisma.users.findUnique({
			where: { id: decoded.userId },
		})
		return user
	} catch {
		return null
	}
}

export const uploadRouter: FileRouter = {
	// Profile image uploader
	profileImage: f({
		image: {
			maxFileSize: '4MB',
			maxFileCount: 1,
		},
	})
		.middleware(async ({ req }) => {
			// req vient d'Express via uploadthing/express — on le passe directement au helper typé
			const user = await getUserFromRequest(req as Request)

			if (!user) {
				throw new UnauthorizedError('You must be logged in to upload a profile image !')
			}

			return { userId: user.id }
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// Update user profile image in database
			await prisma.users.update({
				where: { id: metadata.userId },
				data: { image: file.ufsUrl },
			})

			return { uploadedBy: metadata.userId, url: file.ufsUrl }
		}),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
