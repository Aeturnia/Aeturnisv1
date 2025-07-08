/**
 * Movement Controller
 * Handles HTTP requests for character movement and zone transitions
 */

import { Request, Response } from 'express';
import { MoveRequest, MoveResponse, Direction, Zone } from '@aeturnis/shared';
import { logger } from '../utils/logger';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';

/**
 * Execute character movement
 * POST /api/v1/movement/move
 */
export const executeMovement = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId, currentZoneId, direction }: MoveRequest = req.body;

    // Validate request data
    if (!characterId || !currentZoneId || !direction) {
      return sendValidationError(res, 'Character ID, current zone ID, and direction are required');
    }

    const validDirections: Direction[] = ['north', 'south', 'east', 'west'];
    if (!validDirections.includes(direction)) {
      return sendValidationError(res, 'Direction must be north, south, east, or west');
    }

    // Mock zone map for movement validation
    const zoneExits: Record<string, Record<Direction, string | undefined>> = {
      "starter_city": {
        north: "forest_edge",
        east: "trade_road",
        south: undefined,
        west: undefined
      },
      "forest_edge": {
        south: "starter_city",
        north: "deep_forest",
        east: "goblin_camp",
        west: undefined
      },
      "trade_road": {
        west: "starter_city",
        north: "crossroads",
        east: "mining_outpost",
        south: undefined
      },
      "deep_forest": {
        south: "forest_edge",
        east: "ancient_ruins",
        north: undefined,
        west: undefined
      },
      "goblin_camp": {
        west: "forest_edge",
        south: "crossroads",
        north: "ancient_ruins",
        east: undefined
      },
      "crossroads": {
        west: "forest_edge",
        south: "trade_road",
        north: "goblin_camp",
        east: "eastern_plains"
      },
      "mining_outpost": {
        west: "trade_road",
        north: "mountain_pass",
        south: undefined,
        east: undefined
      },
      "ancient_ruins": {
        west: "deep_forest",
        south: "goblin_camp",
        north: undefined,
        east: undefined
      }
    };

    interface ZoneData extends Omit<Zone, 'exits' | 'levelRequirement'> {
      exits: Record<string, string>;
      levelRequirement: number;
      dangerLevel?: number;
      monsters?: string[];
    }

    const zoneData: Record<string, ZoneData> = {
      "starter_city": {
        id: "starter_city",
        displayName: "Haven's Rest",
        description: "A peaceful city where adventurers begin their journey",
        coordinates: { x: 0, y: 0 },
        boundaries: { minX: -50, maxX: 50, minY: -50, maxY: 50 },
        exits: { north: "forest_edge", east: "trade_road" },
        type: "city" as const,
        features: ["shops", "trainers", "bank"],
        levelRequirement: 1
      },
      "forest_edge": {
        id: "forest_edge",
        displayName: "Whispering Woods Edge",
        description: "The border between civilization and the wild forest",
        coordinates: { x: 0, y: 100 },
        boundaries: { minX: -50, maxX: 50, minY: 50, maxY: 150 },
        exits: { south: "starter_city", north: "deep_forest", east: "goblin_camp" },
        type: "normal" as const,
        features: ["monsters", "gathering_nodes"],
        levelRequirement: 2
      },
      "trade_road": {
        id: "trade_road",
        displayName: "Merchant's Highway",
        description: "A well-traveled road connecting major settlements",
        coordinates: { x: 100, y: 0 },
        boundaries: { minX: 50, maxX: 150, minY: -50, maxY: 50 },
        exits: { west: "starter_city", north: "crossroads", east: "mining_outpost" },
        type: "normal" as const,
        features: ["merchants", "caravans"],
        levelRequirement: 1
      },
      "deep_forest": {
        id: "deep_forest",
        displayName: "Shadowheart Grove",
        description: "Deep within the forest where danger lurks",
        coordinates: { x: 0, y: 200 },
        boundaries: { minX: -75, maxX: 75, minY: 150, maxY: 275 },
        exits: { south: "forest_edge", east: "ancient_ruins" },
        type: "normal" as const,
        features: ["elite_monsters", "rare_herbs"],
        levelRequirement: 5
      },
      "goblin_camp": {
        id: "goblin_camp",
        displayName: "Ragtooth Goblin Camp",
        description: "A crude settlement of hostile goblins",
        coordinates: { x: 100, y: 100 },
        boundaries: { minX: 50, maxX: 150, minY: 50, maxY: 150 },
        exits: { west: "forest_edge", south: "crossroads", north: "ancient_ruins" },
        type: "normal" as const,
        features: ["goblin_monsters", "loot_chests"],
        levelRequirement: 3
      }
    };

    // Check if current zone exists
    if (!zoneExits[currentZoneId]) {
      return sendNotFound(res, 'Current zone', currentZoneId);
    }

    // Check if movement direction is valid
    const targetZoneId = zoneExits[currentZoneId][direction];
    if (!targetZoneId) {
      return sendValidationError(res, `Cannot move ${direction} from ${currentZoneId}. No exit available in that direction.`);
    }

    // Check if target zone exists
    const targetZone = zoneData[targetZoneId];
    if (!targetZone) {
      return sendNotFound(res, 'Target zone', targetZoneId);
    }

    // Mock movement cooldown check (2 seconds)
    const movementCooldowns: Record<string, number> = {}; // In production, this would be persistent
    const lastMovement = movementCooldowns[characterId] || 0;
    const cooldownMs = 2000;
    const timeSinceLastMove = Date.now() - lastMovement;

    if (timeSinceLastMove < cooldownMs) {
      const remainingCooldown = cooldownMs - timeSinceLastMove;
      return sendError(res, 'Movement on cooldown', `Please wait ${Math.ceil(remainingCooldown / 1000)} seconds before moving again`, 429, { cooldownRemaining: remainingCooldown });
    }

    // Execute movement (set cooldown)
    movementCooldowns[characterId] = Date.now();

    // Calculate new position (center of target zone)
    const newPosition = {
      x: (targetZone.boundaries.minX + targetZone.boundaries.maxX) / 2,
      y: (targetZone.boundaries.minY + targetZone.boundaries.maxY) / 2
    };

    const response: MoveResponse = {
      success: true,
      newZoneId: targetZoneId,
      zoneInfo: targetZone,
      characterPosition: {
        zoneId: targetZoneId,
        coordinates: newPosition
      },
      message: `Successfully moved ${direction} to ${targetZone.displayName}`,
      timestamp: Date.now()
    };

    logger.info(`Character ${characterId} moved ${direction} from ${currentZoneId} to ${targetZoneId}`);
    return sendSuccess(res, response, response.message);

  } catch (error) {
    logger.error('Error executing movement:', error);
    return sendError(res, 'Movement failed', 'An error occurred while processing movement');
  }
};

/**
 * Validate movement
 * POST /api/v1/movement/validate
 */
export const validateMovement = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId, fromZoneId, toZoneId, direction } = req.body;

    if (!characterId || !fromZoneId || !toZoneId || !direction) {
      return sendValidationError(res, 'Character ID, from/to zone IDs, and direction are required');
    }

    // Mock validation logic
    const zoneExits: Record<string, Record<string, string | undefined>> = {
      "starter_city": { north: "forest_edge", east: "trade_road" },
      "forest_edge": { south: "starter_city", north: "deep_forest", east: "goblin_camp" }
    };

    const expectedExit = zoneExits[fromZoneId]?.[direction];
    const isValidExit = expectedExit === toZoneId;

    // Mock cooldown check
    const hasCooldown = false; // Would check actual cooldown in production

    // Mock level requirement check
    const meetsLevelRequirement = true; // Would check character level in production

    const allowed = isValidExit && !hasCooldown && meetsLevelRequirement;
    let reason: string | undefined;

    if (!isValidExit) reason = `No ${direction} exit from ${fromZoneId} to ${toZoneId}`;
    else if (hasCooldown) reason = 'Movement on cooldown';
    else if (!meetsLevelRequirement) reason = 'Insufficient level for target zone';

    return sendSuccess(res, {
      allowed,
      reason,
      cooldownRemaining: hasCooldown ? 1500 : 0,
      characterId,
      fromZoneId,
      toZoneId,
      direction
    });

    logger.info(`Movement validation: ${characterId} ${fromZoneId} -> ${toZoneId} (${direction}): ${allowed ? 'ALLOWED' : 'DENIED'}`);

  } catch (error) {
    logger.error('Error validating movement:', error);
    return sendError(res, 'Validation failed', 'An error occurred while validating movement');
  }
};

/**
 * Get character position
 * GET /api/v1/movement/position/:characterId
 */
export const getCharacterPosition = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;

    if (!characterId) {
      return sendValidationError(res, 'Character ID parameter is required');
    }

    // Mock character position
    interface CharacterPosition {
      characterId: string;
      zoneId: string;
      coordinates: { x: number; y: number };
      lastMovement: number;
    }

    const mockPositions: Record<string, CharacterPosition> = {
      "char_001": {
        characterId: "char_001",
        zoneId: "starter_city",
        coordinates: { x: 0, y: 0 },
        lastMovement: Date.now() - 10000
      },
      "test_player": {
        characterId: "test_player",
        zoneId: "forest_edge",
        coordinates: { x: 5, y: 75 },
        lastMovement: Date.now() - 5000
      }
    };

    const position = mockPositions[characterId];
    if (!position) {
      return sendNotFound(res, 'Character position', characterId);
    }

    return sendSuccess(res, position);
    logger.info(`Retrieved position for character ${characterId}: ${position.zoneId} (${position.coordinates.x}, ${position.coordinates.y})`);

  } catch (error) {
    logger.error('Error getting character position:', error);
    return sendError(res, 'Failed to get position', 'An error occurred while retrieving character position');
  }
};

/**
 * Get movement test data
 * GET /api/v1/movement/test
 */
export const getMovementTest = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const testData = {
      message: "Movement Service Test - Mock Data",
      timestamp: Date.now(),
      features: {
        movementValidation: true,
        cooldownSystem: true,
        zoneTransitions: true,
        levelRequirements: true
      },
      sampleMovements: [
        {
          from: "starter_city",
          to: "forest_edge", 
          direction: "north",
          valid: true
        },
        {
          from: "forest_edge",
          to: "starter_city",
          direction: "south", 
          valid: true
        },
        {
          from: "starter_city",
          to: "deep_forest",
          direction: "north",
          valid: false,
          reason: "No direct path"
        }
      ],
      cooldownSettings: {
        movementCooldownMs: 2000,
        description: "2 second cooldown between movements"
      }
    };

    return sendSuccess(res, testData, 'Movement test data retrieved');
    logger.info('Movement service test data retrieved');

  } catch (error) {
    logger.error('Error in movement test endpoint:', error);
    return sendError(res, 'Movement test failed', 'An error occurred during movement service testing');
  }
};