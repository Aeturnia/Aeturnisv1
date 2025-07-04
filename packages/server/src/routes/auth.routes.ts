import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/asyncHandler';
import { rateLimiter } from '../middleware/rateLimiter';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const authService = new AuthService();

// Rate limiting for login endpoint
const loginLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per IP
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration endpoint
router.post('/register', asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  
  res.status(201).json({
    success: true,
    data: result,
  });
}));

// Login endpoint with rate limiting
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  
  res.json({
    success: true,
    data: result,
  });
}));

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token required',
    });
  }
  
  const result = await authService.refreshTokens(refreshToken);
  
  res.json({
    success: true,
    data: result,
  });
}));

// Logout endpoint
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

// Protected route to get current user profile
router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
}));

// Protected route to verify token
router.get('/verify', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user: req.user,
    },
  });
}));

export default router;