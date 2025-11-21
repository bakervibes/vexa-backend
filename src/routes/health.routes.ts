import { Router, type Router as ExpressRouter } from 'express'
import { databaseCheck, healthCheck } from '../controllers/health.controller'

const router: ExpressRouter = Router()

/**
 * @route   GET /api/health
 * @desc    Vérifier que l'API fonctionne
 * @access  Public
 */
router.get('/', healthCheck)

/**
 * @route   GET /api/health/db
 * @desc    Vérifier la connexion à la base de données
 * @access  Public
 */
router.get('/db', databaseCheck)

export default router
