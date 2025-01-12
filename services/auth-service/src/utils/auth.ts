import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../models/User';

export const generateAuthTokens = (user: IUser) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};
