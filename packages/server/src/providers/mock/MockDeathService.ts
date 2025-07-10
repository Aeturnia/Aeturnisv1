import { 
  IDeathService, 
  IDeathRequest,
  IDeathResponse,
  IRespawnResponse,
  IDeathStatus,
  ReviveType
} from '../interfaces/IDeathService';
import { logger } from '../../utils/logger';

/**
 * Mock implementation of DeathService for testing
 * Uses in-memory data storage
 */
export class MockDeathService implements IDeathService {
  /**
   * Get the service name (from IService)
   */
  getName(): string {
    return 'MockDeathService';
  }
  // Mock death records: characterId -> death status
  private deathRecords: Map<string, IDeathStatus> = new Map();
  
  // Mock respawn cooldowns: characterId -> cooldown end time
  private respawnCooldowns: Map<string, number> = new Map();

  constructor() {
    logger.info('MockDeathService initialized');
  }

  async processCharacterDeath(characterId: string, deathRequest: IDeathRequest): Promise<IDeathResponse> {
    logger.info(`MockDeathService: Processing death for character ${characterId}, reason: ${deathRequest.reason}`);
    
    const deathAt = new Date().toISOString();
    
    // Calculate mock penalties
    const penalties = {
      xpLoss: 1000,
      xpLossPercentage: 0.1, // 10% XP loss
      durabilityDamage: [
        {
          itemId: 'item_001',
          slot: 'weapon',
          damagePercent: 0.15,
          newDurability: 85
        },
        {
          itemId: 'item_002', 
          slot: 'armor',
          damagePercent: 0.15,
          newDurability: 90
        }
      ],
      goldLoss: 100
    };
    
    // Set 30 second respawn cooldown
    const respawnCooldownEnd = Date.now() + 30000;
    this.respawnCooldowns.set(characterId, respawnCooldownEnd);
    
    // Update death status
    const deathStatus: IDeathStatus = {
      isDead: true,
      deathAt,
      canRespawn: false, // Will be true after cooldown
      respawnCooldownMs: 30000,
      availableReviveTypes: [ReviveType.SELF_RESPAWN, ReviveType.PLAYER_ASSIST]
    };
    
    this.deathRecords.set(characterId, deathStatus);
    
    return {
      success: true,
      deathAt,
      penalties
    };
  }

  async processCharacterRespawn(characterId: string): Promise<IRespawnResponse> {
    logger.info(`MockDeathService: Processing respawn for character ${characterId}`);
    
    const deathStatus = this.deathRecords.get(characterId);
    if (!deathStatus || !deathStatus.isDead) {
      throw new Error('Character is not dead');
    }
    
    // Check cooldown
    const cooldownEnd = this.respawnCooldowns.get(characterId) || 0;
    if (Date.now() < cooldownEnd) {
      throw new Error('Respawn cooldown still active');
    }
    
    // Clear death status
    this.deathRecords.delete(characterId);
    this.respawnCooldowns.delete(characterId);
    
    // Mock respawn location (starter zone graveyard)
    const respawnLocation = {
      zoneId: 'starter_zone',
      x: 100,
      y: 200
    };
    
    return {
      success: true,
      location: respawnLocation,
      revivedAt: new Date().toISOString()
    };
  }

  async getCharacterDeathStatus(characterId: string): Promise<IDeathStatus> {
    logger.info(`MockDeathService: Getting death status for character ${characterId}`);
    
    const deathStatus = this.deathRecords.get(characterId);
    
    if (!deathStatus) {
      // Character is alive
      return {
        isDead: false,
        canRespawn: false,
        respawnCooldownMs: 0,
        availableReviveTypes: []
      };
    }
    
    // Check if cooldown has expired
    const cooldownEnd = this.respawnCooldowns.get(characterId) || 0;
    const remainingCooldown = Math.max(0, cooldownEnd - Date.now());
    
    return {
      ...deathStatus,
      canRespawn: remainingCooldown === 0,
      respawnCooldownMs: remainingCooldown
    };
  }
}