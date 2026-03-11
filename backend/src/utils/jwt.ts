/**
 * JWT signing and verification helpers used by authentication flows.
 */
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * Payload stored inside access and refresh JWTs.
 */
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Generates a short-lived access token for authenticated requests.
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
};

// Generates a long-lived refresh token used to rotate access tokens.
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

// Validates an access token and returns its payload.
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

// Validates a refresh token and returns its payload.
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};
