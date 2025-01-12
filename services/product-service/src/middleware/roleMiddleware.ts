import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const hasRole = allowedRoles.includes(req.user.role);
      if (!hasRole) {
        throw new ForbiddenError('You do not have permission to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
