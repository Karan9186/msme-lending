import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

// Extend Express Request to include requestId
interface RequestWithId extends Request {
  requestId: string;
  startTime: number;
}

export const requestLogging = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  // Add requestId and startTime to request object
  (req as RequestWithId).requestId = requestId;
  (req as RequestWithId).startTime = startTime;
  
  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    query: req.query,
  });

  // Capture response finish
  res.on('finish', () => {
    const processingTime = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      processingTimeMs: processingTime,
      ip: req.ip || req.socket.remoteAddress,
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

export const getRequestId = (req: Request): string => {
  return (req as RequestWithId).requestId;
};

export const getProcessingTime = (req: Request): number => {
  const startTime = (req as RequestWithId).startTime;
  return Date.now() - startTime;
};
