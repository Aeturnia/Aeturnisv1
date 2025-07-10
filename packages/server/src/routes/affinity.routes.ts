/**
 * Affinity Routes
 * Defines all affinity-related API endpoints
 */

import { Router } from 'express';
import { AffinityController } from '../controllers/affinity.controller';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
const affinityController = new AffinityController();

// Rate limiting for affinity endpoints
const affinityRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for affinity tracking
  message: {
    error: 'Too many affinity requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Usage tracking rate limiting (very permissive for gameplay)
const usageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Up to 1 action per second on average
  message: {
    error: 'Too many usage tracking requests, please slow down.',
    retryAfter: '1 minute'
  }
});

// Apply general rate limiting to all affinity routes
router.use(affinityRateLimit);

/**
 * @route GET /api/v1/affinity/test
 * @desc Test affinity service functionality
 * @access Public
 */
router.get('/test', asyncHandler(affinityController.testAffinityService.bind(affinityController)));

/**
 * @route GET /api/v1/affinity/summary/:characterId
 * @desc Get affinity summary for character
 * @access Public
 * @param {string} characterId - Character identifier
 * @query {boolean} includeAchievements - Include achievements in response
 * @query {boolean} includeMilestones - Include milestones in response
 */
router.get('/summary/:characterId', asyncHandler(affinityController.getAffinitySummary.bind(affinityController)));

/**
 * @route POST /api/v1/affinity/weapon/use
 * @desc Track weapon usage and update affinity
 * @access Public
 * @body {TrackWeaponUseRequest} weapon usage data
 */
router.post('/weapon/use', usageRateLimit, asyncHandler(affinityController.trackWeaponUse.bind(affinityController)));

/**
 * @route POST /api/v1/affinity/magic/use
 * @desc Track magic usage and update affinity
 * @access Public
 * @body {TrackMagicUseRequest} magic usage data
 */
router.post('/magic/use', usageRateLimit, asyncHandler(affinityController.trackMagicUse.bind(affinityController)));

/**
 * @route POST /api/v1/affinity/simulate/weapon
 * @desc Simulate weapon usage for testing
 * @access Public
 * @body {object} simulation parameters
 */
router.post('/simulate/weapon', asyncHandler(affinityController.simulateWeaponUse.bind(affinityController)));

/**
 * @route POST /api/v1/affinity/simulate/magic
 * @desc Simulate magic usage for testing
 * @access Public
 * @body {object} simulation parameters
 */
router.post('/simulate/magic', asyncHandler(affinityController.simulateMagicUse.bind(affinityController)));

export { router as affinityRoutes };