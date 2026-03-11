/**
 * HTTP controllers for login, registration, token refresh, and logout flows.
 */
import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';
import { verifyRefreshToken, generateToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error.middleware';

// Service instance used by auth controllers.
const authService = new AuthService();

// Cookie settings for refresh token persistence.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Processes user registration and issues initial authentication tokens.
export const register = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      user,
      accessToken,
    });
  }
);

// Processes credential login and issues authentication tokens.
export const login = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.json({
      user,
      accessToken,
    });
  }
);

// Validates refresh tokens and issues a new access token.
export const refresh = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AppError('Refresh token not found', 401);
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const accessToken = generateToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      res.json({ accessToken });
    } catch {
      next(new AppError('Invalid refresh token', 401));
    }
  }
);

// Clears refresh-token cookies and completes the logout flow.
export const logout = asyncHandler(
  async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }
);

// Retrieves the current authenticated user profile.
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await authService.getMe(req.user!.id);
    res.json(user);
  }
);
