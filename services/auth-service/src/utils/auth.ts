import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../models/User';

interface TokenPayload {
  userId: string;
  role: string;
  type: 'access' | 'refresh';
}

export const generateAuthTokens = (user: IUser) => {
  // Generate access token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      type: 'access'
    } as TokenPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Generate refresh token with longer expiry
  const refreshToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      type: 'refresh'
    } as TokenPayload,
    config.jwt.secret,
    { expiresIn: '7d' } // Refresh token valid for 7 days
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const generateAccessTokenFromRefreshToken = (refreshToken: string) => {
  try {
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Generate new access token
    return jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
        type: 'access'
      } as TokenPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
