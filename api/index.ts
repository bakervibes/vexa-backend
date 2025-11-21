import { createApp } from '../src/app'
import { connectDatabase } from '../src/config/database'

// Initialiser l'application
const app = createApp()

export default async function handler(req: any, res: any) {
	await connectDatabase().catch((err) => {
		console.error('Failed to connect to database', err)
	})

	return app(req, res)
}
