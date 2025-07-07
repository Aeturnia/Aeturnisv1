import { logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { db } from '../database/config';
import { monsters, monsterTypes, spawnPoints, zones } from '../database/schema';
import { eq } from 'drizzle-orm';
import { Position3D } from '@aeturnis/shared';

export class MonsterService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  /**
   * Get all monsters in a specific zone
   */
  async getMonstersInZone(zoneIdOrName: string): Promise<Array<{ id: string; name: string; level: number; hp: number; maxHp: number; position: { x: number; y: number } }>> {
    try {
      logger.info(`Fetching monsters for zone: ${zoneIdOrName}`);
      
      const cacheKey = `monsters:zone:${zoneIdOrName}`;
      const cached = await this.cache.get<Array<{ id: string; name: string; level: number; hp: number; maxHp: number; position: { x: number; y: number } }>>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for monsters in zone: ${zoneIdOrName}`);
        return cached;
      }

      // First, resolve zone name to UUID if needed
      let zoneId = zoneIdOrName;
      if (!zoneIdOrName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's a zone name, look up the UUID
        const zoneResult = await db
          .select({ id: zones.id })
          .from(zones)
          .where(eq(zones.name, zoneIdOrName))
          .limit(1);
        
        if (!zoneResult.length) {
          logger.error(`Zone not found: ${zoneIdOrName}`);
          return [];
        }
        zoneId = zoneResult[0].id;
      }

      const result = await db
        .select({
          id: monsters.id,
          name: monsters.name,
          currentHp: monsters.currentHp,
          maxHp: monsters.maxHp,
          position: monsters.position,
          state: monsters.state,
          aggroList: monsters.aggroList,
          monsterTypeId: monsters.monsterTypeId,
          zoneId: monsters.zoneId,
          spawnPointId: monsters.spawnPointId,
          metadata: monsters.metadata,
          createdAt: monsters.createdAt,
          updatedAt: monsters.updatedAt
        })
        .from(monsters)
        .where(eq(monsters.zoneId, zoneId));

      await this.cache.set(cacheKey, result, 30); // Cache for 30 seconds
      logger.info(`Found ${result.length} monsters in zone: ${zoneId}`);
      return result;
    } catch (error) {
      logger.error(`Error fetching monsters for zone ${zoneIdOrName}:`, error);
      throw error;
    }
  }

  /**
   * Spawn a monster at a specific spawn point
   */
  async spawnMonster(spawnPointId: string): Promise<any> {
    try {
      logger.info(`Spawning monster at spawn point: ${spawnPointId}`);
      
      // Get spawn point details
      const spawnPoint = await db
        .select()
        .from(spawnPoints)
        .where(eq(spawnPoints.id, spawnPointId))
        .limit(1);

      if (!spawnPoint.length) {
        throw new Error(`Spawn point not found: ${spawnPointId}`);
      }

      // Get monster type details
      const monsterType = await db
        .select()
        .from(monsterTypes)
        .where(eq(monsterTypes.id, spawnPoint[0].monsterTypeId))
        .limit(1);

      if (!monsterType.length) {
        throw new Error(`Monster type not found: ${spawnPoint[0].monsterTypeId}`);
      }

      // Create new monster
      const newMonster = {
        monsterTypeId: monsterType[0].id,
        zoneId: spawnPoint[0].zoneId,
        spawnPointId: spawnPoint[0].id,
        name: `${monsterType[0].displayName} ${Math.random().toString(36).substr(2, 4)}`,
        currentHp: monsterType[0].baseHp,
        maxHp: monsterType[0].baseHp,
        position: spawnPoint[0].position,
        state: 'alive',
        aggroList: [],
        metadata: {
          spawned_at: new Date().toISOString(),
          behavior: monsterType[0].aiBehavior
        }
      };

      const result = await db
        .insert(monsters)
        .values(newMonster)
        .returning();

      // Clear cache for this zone
      await this.cache.delete(`monsters:zone:${spawnPoint[0].zoneId}`);
      
      logger.info(`Monster spawned successfully: ${result[0].id}`);
      return result[0];
    } catch (error) {
      logger.error(`Error spawning monster at spawn point ${spawnPointId}:`, error);
      throw error;
    }
  }

  /**
   * Update monster state
   */
  async updateMonsterState(monsterId: string, newState: string, targetId?: string): Promise<any> {
    try {
      logger.info(`Updating monster state: ${monsterId} to ${newState}`);
      
      const updateData: { state: string; updatedAt: Date; metadata?: Record<string, unknown> } = {
        state: newState,
        updatedAt: new Date()
      };

      if (targetId) {
        updateData.metadata = {
          targetId,
          stateChangedAt: new Date().toISOString()
        };
      }

      const result = await db
        .update(monsters)
        .set(updateData)
        .where(eq(monsters.id, monsterId))
        .returning();

      if (!result.length) {
        throw new Error(`Monster not found: ${monsterId}`);
      }

      // Clear cache for this zone
      await this.cache.delete(`monsters:zone:${result[0].zoneId}`);
      
      logger.info(`Monster state updated successfully: ${monsterId}`);
      return result[0];
    } catch (error) {
      logger.error(`Error updating monster state ${monsterId}:`, error);
      throw error;
    }
  }

  /**
   * Get all monster types
   */
  async getMonsterTypes(): Promise<Array<{ id: string; name: string; level: number; baseStats: Record<string, number>; abilities: string[] }>> {
    try {
      logger.info('Fetching all monster types');
      
      const cacheKey = 'monster-types:all';
      const cached = await this.cache.get<Array<{ id: string; name: string; level: number; baseStats: Record<string, number>; abilities: string[] }>>(cacheKey);
      if (cached) {
        logger.info('Cache hit for monster types');
        return cached;
      }

      const result = await db
        .select()
        .from(monsterTypes);

      await this.cache.set(cacheKey, result, 300); // Cache for 5 minutes
      logger.info(`Found ${result.length} monster types`);
      return result;
    } catch (error) {
      logger.error('Error fetching monster types:', error);
      throw error;
    }
  }

  /**
   * Get spawn points for a zone
   */
  async getSpawnPointsByZone(zoneIdOrName: string): Promise<Array<{ id: string; zoneId: string; position: { x: number; y: number }; monsterType: string; respawnRate: number }>> {
    try {
      logger.info(`Fetching spawn points for zone: ${zoneIdOrName}`);
      
      const cacheKey = `spawn-points:zone:${zoneIdOrName}`;
      const cached = await this.cache.get<Array<{ id: string; zoneId: string; position: { x: number; y: number }; monsterType: string; respawnRate: number }>>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for spawn points in zone: ${zoneIdOrName}`);
        return cached;
      }

      // First, resolve zone name to UUID if needed
      let zoneId = zoneIdOrName;
      if (!zoneIdOrName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's a zone name, look up the UUID
        const zoneResult = await db
          .select({ id: zones.id })
          .from(zones)
          .where(eq(zones.name, zoneIdOrName))
          .limit(1);
        
        if (!zoneResult.length) {
          logger.error(`Zone not found: ${zoneIdOrName}`);
          return [];
        }
        zoneId = zoneResult[0].id;
      }

      const result = await db
        .select()
        .from(spawnPoints)
        .where(eq(spawnPoints.zoneId, zoneId));

      await this.cache.set(cacheKey, result, 60); // Cache for 1 minute
      logger.info(`Found ${result.length} spawn points in zone: ${zoneId}`);
      return result;
    } catch (error) {
      logger.error(`Error fetching spawn points for zone ${zoneIdOrName}:`, error);
      throw error;
    }
  }

  /**
   * Process aggro detection for a monster
   */
  async processAggro(monsterId: string, characterPosition: Position3D): Promise<boolean> {
    try {
      // Get monster details
      const monster = await db
        .select()
        .from(monsters)
        .where(eq(monsters.id, monsterId))
        .limit(1);

      if (!monster.length) {
        return false;
      }

      // Get monster type for aggro radius
      const monsterType = await db
        .select()
        .from(monsterTypes)
        .where(eq(monsterTypes.id, monster[0].monsterTypeId))
        .limit(1);

      if (!monsterType.length) {
        return false;
      }

      // Calculate distance
      const monsterPos = monster[0].position as any;
      const distance = Math.sqrt(
        Math.pow(characterPosition.x - monsterPos.x, 2) +
        Math.pow(characterPosition.y - monsterPos.y, 2) +
        Math.pow(characterPosition.z - monsterPos.z, 2)
      );

      // Default aggro radius of 15 if not in metadata
      const aggroRadius = 15;
      return distance <= aggroRadius;
    } catch (error) {
      logger.error(`Error processing aggro for monster ${monsterId}:`, error);
      return false;
    }
  }

  /**
   * Kill a monster and handle death logic
   */
  async killMonster(monsterId: string, killedBy?: string): Promise<void> {
    try {
      logger.info(`Killing monster: ${monsterId}`);

      const updateData = {
        state: 'dead',
        updatedAt: new Date(),
        respawnTime: new Date(Date.now() + 300000), // 5 minutes
        metadata: {
          killedBy,
          killedAt: new Date().toISOString()
        }
      };

      const result = await db
        .update(monsters)
        .set(updateData)
        .where(eq(monsters.id, monsterId))
        .returning();

      if (result.length) {
        // Clear cache for this zone
        await this.cache.delete(`monsters:zone:${result[0].zoneId}`);
        logger.info(`Monster killed successfully: ${monsterId}`);
      }
    } catch (error) {
      logger.error(`Error killing monster ${monsterId}:`, error);
      throw error;
    }
  }

  /**
   * Update monster position
   */
  async updatePosition(monsterId: string, newPosition: Position3D): Promise<void> {
    try {
      const result = await db
        .update(monsters)
        .set({
          position: newPosition,
          updatedAt: new Date()
        })
        .where(eq(monsters.id, monsterId))
        .returning();

      if (result.length) {
        // Clear cache for this zone
        await this.cache.delete(`monsters:zone:${result[0].zoneId}`);
      }
    } catch (error) {
      logger.error(`Error updating position for monster ${monsterId}:`, error);
      throw error;
    }
  }

  /**
   * Process monster AI behavior
   */
  async processAI(monsterId: string): Promise<void> {
    try {
      // Get monster and type details
      const monster = await db
        .select()
        .from(monsters)
        .where(eq(monsters.id, monsterId))
        .limit(1);

      if (!monster.length) {
        return;
      }

      const monsterType = await db
        .select()
        .from(monsterTypes)
        .where(eq(monsterTypes.id, monster[0].monsterTypeId))
        .limit(1);

      if (!monsterType.length) {
        return;
      }

      // Simple AI logic based on behavior type
      const behavior = monsterType[0].aiBehavior;
      
      switch (behavior) {
        case 'aggressive':
          // Look for nearby players to aggro
          break;
        case 'defensive':
          // Only attack if attacked first
          break;
        case 'neutral':
          // Ignore players unless provoked
          break;
        default:
          break;
      }

      logger.debug(`Processed AI for monster ${monsterId} with behavior: ${behavior}`);
    } catch (error) {
      logger.error(`Error processing AI for monster ${monsterId}:`, error);
    }
  }
}