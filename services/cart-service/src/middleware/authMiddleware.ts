import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = {
  authenticate: (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, config.jwt.secret!) as {
          userId: string;
          email: string;
          role: string;
        };

        req.user = decoded;
        next();
      } catch (error) {
        throw new UnauthorizedError('Invalid token');
      }
    } catch (error) {
      next(error);
    }
  },

  authorize: (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new UnauthorizedError('User not authenticated');
        }

        if (!roles.includes(req.user.role)) {
          throw new UnauthorizedError('Unauthorized access');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },
};
