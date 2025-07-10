/**
 * Mock Movement Service Implementation
 * Handles character movement validation, cooldowns, and zone transitions
 */

import { 
  MovementValidation, 
  MovementValidationResult, 
  MovementCooldown, 
  ZoneTransition,
  Direction 
} from '@aeturnis/shared';
import { MockZoneService } from './MockZoneService';
import { logger } from '../../utils/logger';

export class MockMovementService implements MovementValidation {
  /**
   * Get the service name (from IService)
   */
  getName(): string {
    return 'MockMovementService';
  }
  private zoneService: MockZoneService;
  private movementCooldowns: Map<string, MovementCooldown> = new Map();
  private transitionHistory: ZoneTransition[] = [];
  private readonly MOVEMENT_COOLDOWN_MS = 2000; // 2 seconds

  constructor() {
    this.zoneService = new MockZoneService();
    logger.info('MockMovementService initialized');
  }

  /**
   * Check if character can move from one zone to another
   */
  async canMove(
    characterId: string, 
    fromZoneId: string, 
    toZoneId: string, 
    direction: Direction
  ): Promise<MovementValidationResult> {
    try {
      // Check if fromZone exists
      const fromZone = await this.zoneService.getZoneById(fromZoneId);
      if (!fromZone) {
        return {
          allowed: false,
          reason: `Source zone '${fromZoneId}' not found`
        };
      }

      // Check if toZone exists
      const toZone = await this.zoneService.getZoneById(toZoneId);
      if (!toZone) {
        return {
          allowed: false,
          reason: `Target zone '${toZoneId}' not found`
        };
      }

      // Check if exit exists in the requested direction
      const expectedExit = this.zoneService.getZoneExit(fromZoneId, direction);
      if (expectedExit !== toZoneId) {
        return {
          allowed: false,
          reason: `No exit ${direction} from ${fromZone.displayName} to ${toZone.displayName}`
        };
      }

      // Check movement cooldown
      const cooldownRemaining = await this.checkMovementCooldown(characterId);
      if (cooldownRemaining > 0) {
        return {
          allowed: false,
          reason: `Movement on cooldown`,
          cooldownRemaining
        };
      }

      // Check zone requirements (mock character level 5 for testing)
      const meetsRequirements = await this.zoneService.meetsZoneRequirements(characterId, toZoneId, 5);
      if (!meetsRequirements) {
        return {
          allowed: false,
          reason: `You don't meet the requirements to enter ${toZone.displayName}`
        };
      }

      // Check if character is in combat (mock - always false for testing)
      const inCombat = false; // This would check combat service in production
      if (inCombat) {
        return {
          allowed: false,
          reason: `Cannot move while in combat`
        };
      }

      return { allowed: true };

    } catch (error) {
      logger.error('Error validating movement:', error);
      return {
        allowed: false,
        reason: 'Movement validation failed'
      };
    }
  }

  /**
   * Validate zone requirements for character
   */
  async validateZoneRequirements(characterId: string, targetZoneId: string): Promise<boolean> {
    try {
      // Mock character level 5 for testing
      return await this.zoneService.meetsZoneRequirements(characterId, targetZoneId, 5);
    } catch (error) {
      logger.error('Error validating zone requirements:', error);
      return false;
    }
  }

  /**
   * Check movement cooldown for character
   */
  async checkMovementCooldown(characterId: string): Promise<number> {
    const cooldown = this.movementCooldowns.get(characterId);
    if (!cooldown) return 0;

    const elapsed = Date.now() - cooldown.lastMovement;
    const remaining = Math.max(0, cooldown.cooldownMs - elapsed);

    return remaining;
  }

  /**
   * Execute character movement
   */
  async executeMovement(
    characterId: string, 
    fromZoneId: string, 
    toZoneId: string, 
    direction: Direction
  ): Promise<{ success: boolean; reason?: string }> {
    try {
      // Validate movement
      const validation = await this.canMove(characterId, fromZoneId, toZoneId, direction);
      if (!validation.allowed) {
        this.recordTransition(characterId, fromZoneId, toZoneId, direction, false, validation.reason);
        return { success: false, reason: validation.reason };
      }

      // Update character position
      await this.zoneService.updateCharacterPosition(characterId, toZoneId);

      // Set movement cooldown
      this.setMovementCooldown(characterId);

      // Record successful transition
      this.recordTransition(characterId, fromZoneId, toZoneId, direction, true);

      logger.info(`Character ${characterId} successfully moved from ${fromZoneId} to ${toZoneId} via ${direction}`);
      return { success: true };

    } catch (error) {
      logger.error('Error executing movement:', error);
      this.recordTransition(characterId, fromZoneId, toZoneId, direction, false, 'Movement execution failed');
      return { success: false, reason: 'Movement execution failed' };
    }
  }

  /**
   * Set movement cooldown for character
   */
  private setMovementCooldown(characterId: string): void {
    const cooldown: MovementCooldown = {
      characterId,
      lastMovement: Date.now(),
      cooldownMs: this.MOVEMENT_COOLDOWN_MS
    };

    this.movementCooldowns.set(characterId, cooldown);
  }

  /**
   * Record zone transition for history/analytics
   */
  private recordTransition(
    characterId: string, 
    fromZoneId: string, 
    toZoneId: string, 
    direction: Direction, 
    successful: boolean, 
    reason?: string
  ): void {
    const transition: ZoneTransition = {
      characterId,
      fromZoneId,
      toZoneId,
      direction,
      timestamp: Date.now(),
      successful,
      reason
    };

    this.transitionHistory.push(transition);

    // Keep only last 1000 transitions to prevent memory bloat
    if (this.transitionHistory.length > 1000) {
      this.transitionHistory = this.transitionHistory.slice(-1000);
    }
  }

  /**
   * Get movement history for character
   */
  async getMovementHistory(characterId: string, limit: number = 10): Promise<ZoneTransition[]> {
    return this.transitionHistory
      .filter(t => t.characterId === characterId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get current movement cooldowns (for debugging)
   */
  getActiveCooldowns(): MovementCooldown[] {
    const now = Date.now();
    return Array.from(this.movementCooldowns.values())
      .filter(cooldown => (now - cooldown.lastMovement) < cooldown.cooldownMs);
  }

  /**
   * Clear movement cooldown (admin function)
   */
  clearMovementCooldown(characterId: string): void {
    this.movementCooldowns.delete(characterId);
    logger.info(`Movement cooldown cleared for character ${characterId}`);
  }

  /**
   * Get zone service for access to zone data
   */
  getZoneService(): MockZoneService {
    return this.zoneService;
  }
}