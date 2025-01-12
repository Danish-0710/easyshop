import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: string;
        type: 'access' | 'refresh';
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Ensure it's an access token
      if (decoded.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }

      // Attach user info to request
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new UnauthorizedError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};
