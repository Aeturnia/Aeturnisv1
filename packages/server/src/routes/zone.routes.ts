/**
 * Zone Routes
 * Defines API endpoints for zone management and information
 */

import { Router } from 'express';
import { 
  getAllZones, 
  getZoneById, 
  getTestZones, 
  validatePosition 
} from '../controllers/zone.controller';

const router = Router();

/**
 * @route GET /api/v1/zones
 * @desc Get all zones
 * @access Public (for testing)
 */
router.get('/', getAllZones);

/**
 * @route GET /api/v1/zones/test
 * @desc Get zone service test data
 * @access Public
 */
router.get('/test', getTestZones);

/**
 * @route GET /api/v1/zones/:zoneId
 * @desc Get zone by ID with optional character position
 * @access Public (for testing)
 * @query characterId - Optional character ID to include position data
 */
router.get('/:zoneId', getZoneById);

/**
 * @route POST /api/v1/zones/validate-position
 * @desc Validate if coordinates are within zone boundaries
 * @access Public (for testing)
 * @body { zoneId: string, coordinates: { x: number, y: number } }
 */
router.post('/validate-position', validatePosition);

export default router;