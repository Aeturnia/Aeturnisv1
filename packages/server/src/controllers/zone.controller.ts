/**
 * Zone Controller
 * Handles HTTP requests for zone management and information
 */

import { Request, Response } from 'express';
import { ZoneListResponse, ZoneDetailsResponse } from '@aeturnis/shared';
import { logger } from '../utils/logger';

// Zone boundary type for validation
interface ZoneBoundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface ZoneData {
  boundaries: ZoneBoundaries;
}

/**
 * Get all zones
 * GET /api/v1/zones
 */
export const getAllZones = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Mock response - in production this would use ServiceProvider
    const mockZones = [
      {
        id: "starter_city",
        displayName: "Haven's Rest",
        description: "A peaceful city where adventurers begin their journey",
        coordinates: { x: 0, y: 0 },
        boundaries: { minX: -50, maxX: 50, minY: -50, maxY: 50 },
        exits: { north: "forest_edge", east: "trade_road" },
        type: "city" as const,
        features: ["shops", "trainers", "bank", "quest_givers", "respawn_point"],
        levelRequirement: 1
      },
      {
        id: "forest_edge",
        displayName: "Whispering Woods Edge",
        description: "The border between civilization and the wild forest",
        coordinates: { x: 0, y: 100 },
        boundaries: { minX: -50, maxX: 50, minY: 50, maxY: 150 },
        exits: { south: "starter_city", north: "deep_forest", east: "goblin_camp" },
        type: "normal" as const,
        features: ["monsters", "gathering_nodes", "herbs"],
        levelRequirement: 2
      },
      {
        id: "trade_road",
        displayName: "Merchant's Highway",
        description: "A well-traveled road connecting major settlements",
        coordinates: { x: 100, y: 0 },
        boundaries: { minX: 50, maxX: 150, minY: -50, maxY: 50 },
        exits: { west: "starter_city", north: "crossroads", east: "mining_outpost" },
        type: "normal" as const,
        features: ["merchants", "caravans", "safe_travel"],
        levelRequirement: 1
      },
      {
        id: "deep_forest",
        displayName: "Shadowheart Grove",
        description: "Deep within the forest where sunlight barely penetrates",
        coordinates: { x: 0, y: 200 },
        boundaries: { minX: -75, maxX: 75, minY: 150, maxY: 275 },
        exits: { south: "forest_edge", east: "ancient_ruins" },
        type: "normal" as const,
        features: ["elite_monsters", "rare_herbs", "hidden_treasures"],
        levelRequirement: 5
      },
      {
        id: "goblin_camp",
        displayName: "Ragtooth Goblin Camp",
        description: "A crude settlement of goblins with wooden palisades",
        coordinates: { x: 100, y: 100 },
        boundaries: { minX: 50, maxX: 150, minY: 50, maxY: 150 },
        exits: { west: "forest_edge", south: "crossroads", north: "ancient_ruins" },
        type: "normal" as const,
        features: ["goblin_monsters", "loot_chests", "quest_objectives"],
        levelRequirement: 3
      },
      {
        id: "mining_outpost",
        displayName: "Ironpeak Mining Outpost",
        description: "A frontier mining settlement carved into the mountainside",
        coordinates: { x: 200, y: 0 },
        boundaries: { minX: 150, maxX: 250, minY: -50, maxY: 50 },
        exits: { west: "trade_road", north: "mountain_pass" },
        type: "normal" as const,
        features: ["mining_nodes", "blacksmith", "ore_traders"],
        levelRequirement: 4
      },
      {
        id: "crossroads",
        displayName: "Four Winds Crossroads",
        description: "Where four major paths converge",
        coordinates: { x: 100, y: 50 },
        boundaries: { minX: 75, maxX: 125, minY: 25, maxY: 75 },
        exits: { west: "forest_edge", south: "trade_road", north: "goblin_camp", east: "eastern_plains" },
        type: "normal" as const,
        features: ["travelers", "crossroad_shrine"],
        levelRequirement: 2
      },
      {
        id: "ancient_ruins",
        displayName: "Forgotten Temple Ruins",
        description: "Ancient stone structures overgrown with vines",
        coordinates: { x: 150, y: 200 },
        boundaries: { minX: 100, maxX: 200, minY: 150, maxY: 250 },
        exits: { west: "deep_forest", south: "goblin_camp" },
        type: "dungeon" as const,
        features: ["ancient_magic", "puzzle_doors", "boss_chambers"],
        levelRequirement: 8
      }
    ];

    const response: ZoneListResponse = {
      zones: mockZones,
      total: mockZones.length
    };

    logger.info(`Retrieved ${mockZones.length} zones`);
    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching zones:', error);
    return res.status(500).json({
      error: 'Failed to fetch zones',
      message: 'An error occurred while retrieving zone information'
    });
  }
};

/**
 * Get zone by ID
 * GET /api/v1/zones/:zoneId
 */
export const getZoneById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { zoneId } = req.params;
    const characterId = req.query.characterId as string;

    if (!zoneId) {
      return res.status(400).json({
        error: 'Zone ID required',
        message: 'Zone ID parameter is required'
      });
    }

    // Mock zone lookup
    const zones = {
      "starter_city": {
        id: "starter_city",
        displayName: "Haven's Rest",
        description: "A peaceful city where adventurers begin their journey. The town square bustles with merchants and trainers.",
        coordinates: { x: 0, y: 0 },
        boundaries: { minX: -50, maxX: 50, minY: -50, maxY: 50 },
        exits: { north: "forest_edge", east: "trade_road" },
        type: "city" as const,
        features: ["shops", "trainers", "bank", "quest_givers", "respawn_point"],
        levelRequirement: 1
      },
      "forest_edge": {
        id: "forest_edge",
        displayName: "Whispering Woods Edge",
        description: "The border between civilization and the wild forest. Ancient trees tower overhead.",
        coordinates: { x: 0, y: 100 },
        boundaries: { minX: -50, maxX: 50, minY: 50, maxY: 150 },
        exits: { south: "starter_city", north: "deep_forest", east: "goblin_camp" },
        type: "normal" as const,
        features: ["monsters", "gathering_nodes", "herbs"],
        levelRequirement: 2
      }
    };

    const zone = zones[zoneId as keyof typeof zones];
    if (!zone) {
      return res.status(404).json({
        error: 'Zone not found',
        message: `Zone with ID '${zoneId}' does not exist`
      });
    }

    // Mock character position if characterId provided
    const characterPosition = characterId ? {
      characterId,
      zoneId,
      coordinates: { x: 0, y: 0 },
      lastMovement: Date.now() - 5000
    } : undefined;

    const availableExits = Object.values(zone.exits).filter(Boolean) as string[];

    const response: ZoneDetailsResponse = {
      zone,
      characterPosition,
      availableExits
    };

    logger.info(`Retrieved zone details for ${zoneId}${characterId ? ` (character: ${characterId})` : ''}`);
    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching zone details:', error);
    return res.status(500).json({
      error: 'Failed to fetch zone details',
      message: 'An error occurred while retrieving zone information'
    });
  }
};

/**
 * Get test zone data
 * GET /api/v1/zones/test
 */
export const getTestZones = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const testData = {
      message: "Zone Service Test - Mock Data",
      timestamp: Date.now(),
      totalZones: 8,
      sampleZones: [
        {
          id: "starter_city",
          displayName: "Haven's Rest",
          type: "city",
          levelRequirement: 1,
          exits: { north: "forest_edge", east: "trade_road" }
        },
        {
          id: "ancient_ruins",
          displayName: "Forgotten Temple Ruins",
          type: "dungeon",
          levelRequirement: 8,
          exits: { west: "deep_forest", south: "goblin_camp" }
        }
      ],
      features: {
        interconnectedWorld: true,
        movementValidation: true,
        levelRequirements: true,
        boundarySystem: true
      }
    };

    logger.info('Zone service test data retrieved');
    return res.status(200).json(testData);
  } catch (error) {
    logger.error('Error in zone test endpoint:', error);
    return res.status(500).json({
      error: 'Zone test failed',
      message: 'An error occurred during zone service testing'
    });
  }
};

/**
 * Validate zone boundaries
 * POST /api/v1/zones/validate-position
 */
export const validatePosition = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { zoneId, coordinates } = req.body;

    if (!zoneId || !coordinates || typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Zone ID and coordinates (x, y) are required'
      });
    }

    // Mock boundary validation
    const zones: Record<string, ZoneData> = {
      "starter_city": { boundaries: { minX: -50, maxX: 50, minY: -50, maxY: 50 } },
      "forest_edge": { boundaries: { minX: -50, maxX: 50, minY: 50, maxY: 150 } }
    };

    const zone = zones[zoneId];
    if (!zone) {
      return res.status(404).json({
        error: 'Zone not found',
        message: `Zone '${zoneId}' does not exist`
      });
    }

    const { boundaries } = zone;
    const isValid = (
      coordinates.x >= boundaries.minX &&
      coordinates.x <= boundaries.maxX &&
      coordinates.y >= boundaries.minY &&
      coordinates.y <= boundaries.maxY
    );

    logger.info(`Position validation for ${zoneId} at (${coordinates.x}, ${coordinates.y}): ${isValid ? 'VALID' : 'INVALID'}`);
    
    return res.status(200).json({
      valid: isValid,
      zoneId,
      coordinates,
      boundaries,
      message: isValid ? 'Position is within zone boundaries' : 'Position is outside zone boundaries'
    });
  } catch (error) {
    logger.error('Error validating position:', error);
    return res.status(500).json({
      error: 'Position validation failed',
      message: 'An error occurred while validating position'
    });
  }
};