import { DeathRepository } from '../repositories/death.repository';
import { CacheService } from './CacheService';
import { 
  IDeathEvent, 
  IDeathRequest, 
  IDeathResponse, 
  IRespawnResponse, 
  IDeathStatus,
  IPenaltyBreakdown,
  IDurabilityPenalty,
  DeathReason,
  ReviveType
} from '../types/death';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class DeathService {
  private static readonly RESPAWN_COOLDOWN_MS = 30000; // 30 seconds
  private static readonly XP_LOSS_PERCENTAGE = 0.8; // 80% experience loss - SEVERE PENALTY
  private static readonly GOLD_LOSS_PERCENTAGE = 1.0; // 100% gold loss - COMPLETE GOLD LOSS

  constructor(
    private deathRepository: DeathRepository,
    private cacheService: CacheService
  ) {}

  /**
   * Process character death with penalties and event logging
   */
  async processCharacterDeath(
    characterId: string,
    deathRequest: IDeathRequest
  ): Promise<IDeathResponse> {
    logger.info('Processing character death', { characterId, reason: deathRequest.reason });

    // Validate death request
    await this.validateDeathRequest(characterId, deathRequest);

    // Get character current status
    const deathStatus = await this.deathRepository.getCharacterDeathStatus(characterId);
    
    if (deathStatus.isDead) {
      throw new ConflictError('Character is already dead');
    }

    // Get character zone for death event
    const zoneId = await this.deathRepository.getCharacterZone(characterId);

    // Create death event
    const deathEvent: IDeathEvent = {
      characterId,
      reason: deathRequest.reason,
      killerId: deathRequest.killerId,
      context: deathRequest.context,
      deathAt: new Date(),
      zoneId,
      position: { x: 0, y: 0 }, // TODO: Get actual position from character
    };

    // Calculate and apply penalties
    const penalties = await this.calculateDeathPenalties(characterId);
    await this.applyDeathPenalties(characterId, penalties);

    // Mark character as dead
    await this.deathRepository.markCharacterDead(characterId, deathEvent);

    // Set respawn cooldown
    await this.setRespawnCooldown(characterId);

    logger.info('Character death processed successfully', { 
      characterId, 
      penalties: penalties.xpLoss,
      deathCount: deathStatus.deathCount + 1
    });

    return {
      success: true,
      deathAt: deathEvent.deathAt.toISOString(),
      penalties,
    };
  }

  /**
   * Process character respawn
   */
  async processCharacterRespawn(characterId: string): Promise<IRespawnResponse> {
    logger.info('Processing character respawn', { characterId });

    // Check if character is dead
    const deathStatus = await this.deathRepository.getCharacterDeathStatus(characterId);
    
    if (!deathStatus.isDead) {
      throw new ValidationError('Character is not dead');
    }

    // Check respawn cooldown
    const canRespawn = await this.canCharacterRespawn(characterId);
    if (!canRespawn) {
      throw new ValidationError('Respawn cooldown has not expired');
    }

    // Get character zone and find respawn point
    const zoneId = await this.deathRepository.getCharacterZone(characterId);
    const respawnPoint = await this.deathRepository.getDefaultRespawnPoint(zoneId);

    if (!respawnPoint) {
      throw new NotFoundError('No respawn point available in current zone');
    }

    // Revive character
    await this.deathRepository.reviveCharacter(characterId);

    // Update character position to respawn point
    await this.deathRepository.updateCharacterPosition(
      characterId, 
      respawnPoint.x, 
      respawnPoint.y
    );

    // Clear respawn cooldown
    await this.clearRespawnCooldown(characterId);

    logger.info('Character respawn processed successfully', { 
      characterId, 
      respawnPoint: respawnPoint.name 
    });

    return {
      success: true,
      location: {
        zoneId: respawnPoint.zoneId,
        x: respawnPoint.x,
        y: respawnPoint.y,
      },
      revivedAt: new Date().toISOString(),
    };
  }

  /**
   * Get character death status
   */
  async getCharacterDeathStatus(characterId: string): Promise<IDeathStatus> {
    const deathStatus = await this.deathRepository.getCharacterDeathStatus(characterId);
    const canRespawn = await this.canCharacterRespawn(characterId);
    const cooldownMs = await this.getRespawnCooldownMs(characterId);

    return {
      isDead: deathStatus.isDead,
      deathAt: deathStatus.deathAt?.toISOString(),
      canRespawn,
      respawnCooldownMs: cooldownMs,
      availableReviveTypes: this.getAvailableReviveTypes(deathStatus.isDead),
    };
  }

  /**
   * Validate death request
   */
  private async validateDeathRequest(
    characterId: string, 
    request: IDeathRequest
  ): Promise<void> {
    if (!characterId) {
      throw new ValidationError('Character ID is required');
    }

    if (!Object.values(DeathReason).includes(request.reason)) {
      throw new ValidationError('Invalid death reason');
    }

    // Validate killer if provided
    if (request.killerId) {
      try {
        await this.deathRepository.getCharacterDeathStatus(request.killerId);
      } catch (_error) {
        throw new ValidationError('Invalid killer ID');
      }
    }
  }

  /**
   * Calculate death penalties
   */
  private async calculateDeathPenalties(characterId: string): Promise<IPenaltyBreakdown> {
    // TODO: Get character level and experience from character repository
    console.log(`Calculating death penalties for character: ${characterId}`);
    const mockExperience = 5000; // Mock data for now
    const mockGold = 1000; // Mock data for now
    
    const xpLoss = Math.floor(mockExperience * DeathService.XP_LOSS_PERCENTAGE);
    const goldLoss = Math.floor(mockGold * DeathService.GOLD_LOSS_PERCENTAGE);
    
    // TODO: Get equipped items and calculate durability damage
    const durabilityDamage: IDurabilityPenalty[] = [];

    return {
      xpLoss,
      xpLossPercentage: DeathService.XP_LOSS_PERCENTAGE * 100,
      durabilityDamage,
      goldLoss,
    };
  }

  /**
   * Apply death penalties to character
   */
  private async applyDeathPenalties(
    characterId: string, 
    penalties: IPenaltyBreakdown
  ): Promise<void> {
    // Apply experience penalty
    if (penalties.xpLoss > 0) {
      await this.deathRepository.applyExperiencePenalty(characterId, penalties.xpLoss);
    }

    // Apply gold penalty
    if (penalties.goldLoss && penalties.goldLoss > 0) {
      await this.deathRepository.applyGoldPenalty(characterId, penalties.goldLoss);
    }

    // TODO: Apply durability penalties to equipped items
  }

  /**
   * Set respawn cooldown
   */
  private async setRespawnCooldown(characterId: string): Promise<void> {
    const cooldownKey = `respawn:cooldown:${characterId}`;
    await this.cacheService.set(
      cooldownKey, 
      'active', 
      Math.floor(DeathService.RESPAWN_COOLDOWN_MS / 1000)
    );
  }

  /**
   * Clear respawn cooldown
   */
  private async clearRespawnCooldown(characterId: string): Promise<void> {
    const cooldownKey = `respawn:cooldown:${characterId}`;
    await this.cacheService.delete(cooldownKey);
  }

  /**
   * Check if character can respawn (cooldown expired)
   */
  private async canCharacterRespawn(characterId: string): Promise<boolean> {
    const cooldownKey = `respawn:cooldown:${characterId}`;
    const cooldown = await this.cacheService.get(cooldownKey);
    return cooldown === null;
  }

  /**
   * Get remaining respawn cooldown in milliseconds
   */
  private async getRespawnCooldownMs(characterId: string): Promise<number> {
    const cooldownKey = `respawn:cooldown:${characterId}`;
    const ttl = await this.cacheService.getTTL(cooldownKey);
    return ttl > 0 ? ttl * 1000 : 0;
  }

  /**
   * Get available revive types based on death status
   */
  private getAvailableReviveTypes(isDead: boolean): ReviveType[] {
    if (!isDead) {
      return [];
    }

    return [
      ReviveType.SELF_RESPAWN,
      ReviveType.ITEM_REVIVE,
      ReviveType.SPELL_REVIVE,
      ReviveType.PLAYER_ASSIST,
    ];
  }
}