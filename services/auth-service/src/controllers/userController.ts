import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const userController = {
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { firstName, lastName },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new ForbiddenError('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      res.json({
        status: 'success',
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find().select('-password');

      res.json({
        status: 'success',
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.userId).select('-password');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, role } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { firstName, lastName, role },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
