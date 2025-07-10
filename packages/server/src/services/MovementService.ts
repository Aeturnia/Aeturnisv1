import { logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { db } from '../database/config';
import { characters } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CharacterPosition, MovementValidation, Direction } from '@aeturnis/shared';

export class MovementService {
  private cache: CacheService;
  private movementCooldowns: Map<string, number> = new Map();

  constructor() {
    this.cache = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
    logger.info('MovementService initialized with database connection');
  }

  /**
   * Get the service name
   */
  getName(): string {
    return 'MovementService';
  }

  /**
   * Get character position
   */
  async getCharacterPosition(characterId: string): Promise<CharacterPosition> {
    try {
      const cacheKey = `position:${characterId}`;
      const cached = await this.cache.get<CharacterPosition>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for character position: ${characterId}`);
        return cached;
      }

      const result = await db.select({
        position: characters.position,
        currentZone: characters.currentZone
      }).from(characters).where(eq(characters.id, characterId)).limit(1);

      if (!result.length) {
        throw new Error(`Character not found: ${characterId}`);
      }

      const position: CharacterPosition = {
        x: result[0].position.x,
        y: result[0].position.y,
        zoneId: result[0].currentZone
      };

      await this.cache.set(cacheKey, position, 60); // Cache for 1 minute
      logger.debug(`Retrieved position for character: ${characterId}`);
      return position;
    } catch (error) {
      logger.error(`Error fetching position for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Move character to new position
   */
  async moveCharacter(characterId: string, newPosition: CharacterPosition): Promise<MovementValidation> {
    try {
      // Check movement cooldown
      const now = Date.now();
      const lastMove = this.movementCooldowns.get(characterId) || 0;
      const cooldownRemaining = Math.max(0, 2000 - (now - lastMove)); // 2 second cooldown

      if (cooldownRemaining > 0) {
        return {
          valid: false,
          reason: `Movement cooldown active. Wait ${Math.ceil(cooldownRemaining / 1000)}s`,
          cooldown: cooldownRemaining
        };
      }

      // Update character position in database
      await db.update(characters)
        .set({
          position: { x: newPosition.x, y: newPosition.y, z: 0 },
          currentZone: newPosition.zoneId,
          updatedAt: new Date()
        })
        .where(eq(characters.id, characterId));

      // Update cache
      const cacheKey = `position:${characterId}`;
      await this.cache.set(cacheKey, newPosition, 60);

      // Set movement cooldown
      this.movementCooldowns.set(characterId, now);

      logger.info(`Character ${characterId} moved to position (${newPosition.x}, ${newPosition.y}) in zone ${newPosition.zoneId}`);
      return {
        valid: true,
        newPosition,
        cooldown: 0
      };
    } catch (error) {
      logger.error(`Error moving character ${characterId}:`, error);
      return {
        valid: false,
        reason: 'Movement failed due to server error',
        cooldown: 0
      };
    }
  }

  /**
   * Validate movement direction
   */
  async validateMovement(characterId: string, direction: Direction): Promise<MovementValidation> {
    try {
      const currentPosition = await this.getCharacterPosition(characterId);
      
      // Calculate new position based on direction
      let newX = currentPosition.x;
      let newY = currentPosition.y;
      
      switch (direction) {
        case Direction.NORTH:
          newY += 10;
          break;
        case Direction.SOUTH:
          newY -= 10;
          break;
        case Direction.EAST:
          newX += 10;
          break;
        case Direction.WEST:
          newX -= 10;
          break;
        case Direction.NORTHEAST:
          newX += 7;
          newY += 7;
          break;
        case Direction.NORTHWEST:
          newX -= 7;
          newY += 7;
          break;
        case Direction.SOUTHEAST:
          newX += 7;
          newY -= 7;
          break;
        case Direction.SOUTHWEST:
          newX -= 7;
          newY -= 7;
          break;
      }

      const newPosition: CharacterPosition = {
        x: newX,
        y: newY,
        zoneId: currentPosition.zoneId
      };

      // Validate the movement
      return await this.moveCharacter(characterId, newPosition);
    } catch (error) {
      logger.error(`Error validating movement for character ${characterId}:`, error);
      return {
        valid: false,
        reason: 'Movement validation failed',
        cooldown: 0
      };
    }
  }

  /**
   * Get movement cooldown for character
   */
  getMovementCooldown(characterId: string): number {
    const lastMove = this.movementCooldowns.get(characterId) || 0;
    const now = Date.now();
    return Math.max(0, 2000 - (now - lastMove));
  }
}