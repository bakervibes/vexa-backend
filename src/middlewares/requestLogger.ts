import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware pour logger les requêtes entrantes
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  // Logger au début de la requête
  logger.info(`➡️  ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  });
  
  // Logger à la fin de la réponse
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };
    
    if (res.statusCode >= 500) {
      logger.error(`⬅️  ${req.method} ${req.path} - ${res.statusCode}`, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`⬅️  ${req.method} ${req.path} - ${res.statusCode}`, logData);
    } else {
      logger.info(`⬅️  ${req.method} ${req.path} - ${res.statusCode}`, logData);
    }
  });
  
  next();
};

