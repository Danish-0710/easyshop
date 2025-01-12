import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { generateAuthTokens } from '../utils/auth';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';

const googleClient = new OAuth2Client(
  config.auth.google.clientId,
  config.auth.google.clientSecret,
  config.auth.google.redirectUri
);

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new BadRequestError('Email already registered');
      }

      // Create new user
      const user = await User.create({
        email,
        password,
        name,
      });

      // Generate auth tokens
      const { accessToken, refreshToken } = generateAuthTokens(user);

      // Send success response
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid password');
      }

      // Generate auth tokens
      const { accessToken, refreshToken } = generateAuthTokens(user);

      // Send success response
      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  },

  async logout(req: Request, res: Response) {
    // In a more complete implementation, you might want to invalidate the refresh token
    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  },

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { name, email },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new BadRequestError('Current password is incorrect');
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

  async getGoogleAuthURL(req: Request, res: Response, next: NextFunction) {
    try {
      const url = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
      });
      res.json({ url });
    } catch (error) {
      next(error);
    }
  },

  async handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;
      
      const { tokens } = await googleClient.getToken(code as string);
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: config.auth.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('No payload from Google');
      }

      // Find or create user
      let user = await User.findOne({ email: payload.email });
      
      if (!user) {
        user = await User.create({
          name: payload.name,
          email: payload.email,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          googleId: payload.sub,
          avatar: payload.picture,
        });
      }

      // Generate token
      const { accessToken, refreshToken } = generateAuthTokens(user);

      // Redirect to frontend with token
      res.redirect(`${config.frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`);
    } catch (error) {
      next(error);
    }
  },
};
