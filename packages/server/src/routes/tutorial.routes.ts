/**
 * Tutorial Routes
 * Defines all tutorial-related API endpoints
 */

import { Router } from 'express';
import { TutorialController } from '../controllers/tutorial.controller';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
const tutorialController = new TutorialController();

// Rate limiting for tutorial endpoints
const tutorialRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many tutorial requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Tutorial progress rate limiting (stricter)
const progressRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit progress updates
  message: {
    error: 'Too many progress updates from this IP, please try again later.',
    retryAfter: '5 minutes'
  }
});

// Apply general rate limiting to all tutorial routes
router.use(tutorialRateLimit);

/**
 * @route GET /api/v1/tutorial/test
 * @desc Test tutorial service functionality
 * @access Public
 */
router.get('/test', asyncHandler(tutorialController.testTutorialService.bind(tutorialController)));

/**
 * @route GET /api/v1/tutorial/zone
 * @desc Get tutorial zone information
 * @access Public
 */
router.get('/zone', asyncHandler(tutorialController.getTutorialZone.bind(tutorialController)));

/**
 * @route GET /api/v1/tutorial/status/:characterId
 * @desc Get character's tutorial status
 * @access Public
 * @param {string} characterId - Character identifier
 */
router.get('/status/:characterId', asyncHandler(tutorialController.getTutorialStatus.bind(tutorialController)));

/**
 * @route GET /api/v1/tutorial/quests
 * @desc Get all tutorial quests
 * @access Public
 */
router.get('/quests', asyncHandler(tutorialController.getAllQuests.bind(tutorialController)));

/**
 * @route POST /api/v1/tutorial/progress
 * @desc Update tutorial progress
 * @access Public
 * @body {UpdateTutorialProgressRequest} progress data
 */
router.post('/progress', progressRateLimit, asyncHandler(tutorialController.updateProgress.bind(tutorialController)));

/**
 * @route GET /api/v1/tutorial/guidance/:characterId
 * @desc Get contextual guidance for character
 * @access Public
 * @param {string} characterId - Character identifier
 */
router.get('/guidance/:characterId', asyncHandler(tutorialController.getGuidance.bind(tutorialController)));

/**
 * @route GET /api/v1/tutorial/help
 * @desc Get help messages based on context
 * @access Public
 * @query {string} context - Help context
 * @query {string} category - Help category
 */
router.get('/help', asyncHandler(tutorialController.getHelp.bind(tutorialController)));

export { router as tutorialRoutes };