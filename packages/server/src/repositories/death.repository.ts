import { db } from '../database/config';
import { characters, respawnPoints } from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { IDeathEvent, IRespawnPoint } from '../types/death';
import { NotFoundError } from '../utils/errors';

export class DeathRepository {
  /**
   * Mark character as dead and update death statistics
   */
  async markCharacterDead(
    characterId: string, 
    deathEvent: IDeathEvent
  ): Promise<void> {
    const result = await db
      .update(characters)
      .set({
        isDead: true,
        deathAt: deathEvent.deathAt,
        deathCount: sql`${characters.deathCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning({ id: characters.id });

    if (result.length === 0) {
      throw new NotFoundError('Character not found');
    }
  }

  /**
   * Revive character and update respawn statistics
   */
  async reviveCharacter(characterId: string): Promise<void> {
    const result = await db
      .update(characters)
      .set({
        isDead: false,
        deathAt: null,
        lastRespawnAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning({ id: characters.id });

    if (result.length === 0) {
      throw new NotFoundError('Character not found');
    }
  }

  /**
   * Get character death status
   */
  async getCharacterDeathStatus(characterId: string): Promise<{
    isDead: boolean;
    deathAt: Date | null;
    deathCount: number;
    lastRespawnAt: Date | null;
  }> {
    const result = await db
      .select({
        isDead: characters.isDead,
        deathAt: characters.deathAt,
        deathCount: characters.deathCount,
        lastRespawnAt: characters.lastRespawnAt,
      })
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError('Character not found');
    }

    return result[0];
  }

  /**
   * Apply experience penalty for character death
   */
  async applyExperiencePenalty(
    characterId: string, 
    experienceLoss: number
  ): Promise<void> {
    await db
      .update(characters)
      .set({
        experience: sql`GREATEST(0, ${characters.experience} - ${experienceLoss})`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId));
  }

  /**
   * Apply gold penalty for character death
   */
  async applyGoldPenalty(
    characterId: string, 
    goldLoss: number
  ): Promise<void> {
    await db
      .update(characters)
      .set({
        gold: sql`GREATEST(0, ${characters.gold} - ${goldLoss})`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId));
  }

  /**
   * Get available respawn points for a zone
   */
  async getRespawnPointsForZone(zoneId: string): Promise<IRespawnPoint[]> {
    const results = await db
      .select()
      .from(respawnPoints)
      .where(eq(respawnPoints.zoneId, zoneId));

    return results.map(point => ({
      id: point.id,
      zoneId: point.zoneId,
      x: point.x,
      y: point.y,
      isGraveyard: point.isGraveyard,
      name: point.name,
      restrictions: point.restrictions as any,
    }));
  }

  /**
   * Get default respawn point for a zone
   */
  async getDefaultRespawnPoint(zoneId: string): Promise<IRespawnPoint | null> {
    const result = await db
      .select()
      .from(respawnPoints)
      .where(
        and(
          eq(respawnPoints.zoneId, zoneId),
          eq(respawnPoints.isGraveyard, false)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const point = result[0];
    return {
      id: point.id,
      zoneId: point.zoneId,
      x: point.x,
      y: point.y,
      isGraveyard: point.isGraveyard,
      name: point.name,
      restrictions: point.restrictions as any,
    };
  }

  /**
   * Get character's current zone for respawn logic
   */
  async getCharacterZone(characterId: string): Promise<string> {
    const result = await db
      .select({ currentZone: characters.currentZone })
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError('Character not found');
    }

    return result[0].currentZone;
  }

  /**
   * Update character position after respawn
   */
  async updateCharacterPosition(
    characterId: string, 
    x: number, 
    y: number
  ): Promise<void> {
    await db
      .update(characters)
      .set({
        position: { x, y, z: 0 },
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId));
  }
}