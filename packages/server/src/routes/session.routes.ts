import { Router, Response } from 'express';
import { sessionManager } from '../services/index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { SessionMetadata } from '../types/session.types';

const router = Router();

// Create a new session
router.post('/create', authenticate, asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  const metadata: SessionMetadata = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    platform: req.body.platform || 'web',
    gameVersion: req.body.gameVersion || '1.0.0',
    deviceId: req.body.deviceId
  };

  const sessionId = await sessionManager.createSession(userId, metadata);
  
  return res.json({
    success: true,
    data: {
      sessionId,
      expiresIn: 30 * 24 * 60 * 60 // 30 days
    }
  });
}));

// Get session information
router.get('/:sessionId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const session = await sessionManager.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found or expired'
    });
  }

  // Only allow users to access their own sessions
  if (session.userId !== req.user?.userId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: session
  });
}));

// Get all user sessions
router.get('/user/sessions', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  const sessions = await sessionManager.getUserSessions(userId);
  
  res.json({
    success: true,
    data: {
      sessions,
      count: sessions.length
    }
  });
}));

// Extend session
router.post('/:sessionId/extend', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const session = await sessionManager.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found or expired'
    });
  }

  // Only allow users to extend their own sessions
  if (session.userId !== req.user?.userId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await sessionManager.extendSession(sessionId);
  
  res.json({
    success: true,
    message: 'Session extended successfully'
  });
}));

// Destroy session
router.delete('/:sessionId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const session = await sessionManager.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found or expired'
    });
  }

  // Only allow users to destroy their own sessions
  if (session.userId !== req.user?.userId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await sessionManager.destroySession(sessionId);
  
  res.json({
    success: true,
    message: 'Session destroyed successfully'
  });
}));

export default router;