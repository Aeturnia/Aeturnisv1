import { logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { db } from '../database/config';
import { zones } from '../database/schema';
import { eq } from 'drizzle-orm';
import { Zone, ZoneListResponse, ZoneDetailsResponse, CharacterPosition } from '@aeturnis/shared';

export class ZoneService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
    logger.info('ZoneService initialized with database connection');
  }

  /**
   * Get the service name
   */
  getName(): string {
    return 'ZoneService';
  }

  /**
   * Get all zones
   */
  async getAllZones(): Promise<ZoneListResponse> {
    try {
      const cacheKey = 'zones:all';
      const cached = await this.cache.get<Zone[]>(cacheKey);
      if (cached) {
        logger.info('Cache hit for all zones');
        return { zones: cached };
      }

      const result = await db.select().from(zones);
      const zoneList: Zone[] = result.map(zone => ({
        id: zone.id,
        displayName: zone.displayName,
        description: zone.description,
        coordinates: zone.coordinates,
        boundaries: zone.boundaries,
        exits: zone.exits,
        type: zone.type,
        features: zone.features,
        levelRequirement: zone.levelRequirement
      }));

      await this.cache.set(cacheKey, zoneList, 300); // Cache for 5 minutes
      logger.info(`Retrieved ${zoneList.length} zones from database`);
      return { zones: zoneList };
    } catch (error) {
      logger.error('Error fetching all zones:', error);
      throw error;
    }
  }

  /**
   * Get zone by ID
   */
  async getZoneById(zoneId: string): Promise<ZoneDetailsResponse> {
    try {
      const cacheKey = `zone:${zoneId}`;
      const cached = await this.cache.get<Zone>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for zone: ${zoneId}`);
        return { zone: cached };
      }

      const result = await db.select().from(zones).where(eq(zones.id, zoneId)).limit(1);
      if (!result.length) {
        throw new Error(`Zone not found: ${zoneId}`);
      }

      const zone: Zone = {
        id: result[0].id,
        displayName: result[0].displayName,
        description: result[0].description,
        coordinates: result[0].coordinates,
        boundaries: result[0].boundaries,
        exits: result[0].exits,
        type: result[0].type,
        features: result[0].features,
        levelRequirement: result[0].levelRequirement
      };

      await this.cache.set(cacheKey, zone, 300); // Cache for 5 minutes
      logger.info(`Retrieved zone: ${zoneId}`);
      return { zone };
    } catch (error) {
      logger.error(`Error fetching zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Validate zone boundaries
   */
  async validateBoundaries(zoneId: string, position: CharacterPosition): Promise<boolean> {
    try {
      const { zone } = await this.getZoneById(zoneId);
      const { boundaries } = zone;
      
      const isValid = position.x >= boundaries.minX && 
                     position.x <= boundaries.maxX &&
                     position.y >= boundaries.minY && 
                     position.y <= boundaries.maxY;
      
      logger.debug(`Boundary validation for zone ${zoneId}: ${isValid}`);
      return isValid;
    } catch (error) {
      logger.error(`Error validating boundaries for zone ${zoneId}:`, error);
      return false;
    }
  }

  /**
   * Check if zone exit is valid
   */
  async validateExit(fromZoneId: string, direction: string): Promise<{ valid: boolean; toZoneId?: string }> {
    try {
      const { zone } = await this.getZoneById(fromZoneId);
      const toZoneId = zone.exits[direction];
      
      if (!toZoneId) {
        return { valid: false };
      }

      // Verify target zone exists
      await this.getZoneById(toZoneId);
      
      logger.debug(`Exit validation: ${fromZoneId} -> ${direction} -> ${toZoneId}`);
      return { valid: true, toZoneId };
    } catch (error) {
      logger.error(`Error validating exit from ${fromZoneId} to ${direction}:`, error);
      return { valid: false };
    }
  }
}