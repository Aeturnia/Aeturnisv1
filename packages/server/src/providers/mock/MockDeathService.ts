import { IDeathService, DeathResult, RespawnResult, DeathStatus, DeathPenalties, Graveyard } from '../interfaces/IDeathService';
import { Position3D } from '@aeturnis/shared';
import { logger } from '../../utils/logger';

/**
 * Mock implementation of DeathService for testing
 * Uses in-memory data storage
 */
export class MockDeathService implements IDeathService {
  // Mock death records
  private deathRecords: Map<string, DeathStatus> = new Map();
  
  // Mock graveyards
  private mockGraveyards: Graveyard[] = [
    {
      id: 'graveyard-001',
      name: 'Starter Town Graveyard',
      zoneId: 'starter_zone',
      position: { x: 100, y: 0, z: 200 },
      faction: 'neutral',
      level: 1
    },
    {
      id: 'graveyard-002',
      name: 'Forest Graveyard',
      zoneId: 'forest_zone',
      position: { x: 500, y: 0, z: 500 },
      faction: 'neutral',
      level: 10
    },
    {
      id: 'graveyard-003',
      name: 'Mountain Graveyard',
      zoneId: 'mountain_zone',
      position: { x: 1000, y: 100, z: 1000 },
      faction: 'neutral',
      level: 20
    }
  ];

  constructor() {
    logger.info('MockDeathService initialized');
  }

  async handleCharacterDeath(characterId: string, location: Position3D): Promise<DeathResult> {
    logger.info(`MockDeathService: Handling death for character ${characterId}`);
    
    // Find nearest graveyard
    const graveyard = await this.findNearestGraveyard('test-zone', location);
    
    // Calculate penalties (mock values)
    const penalties: DeathPenalties = {
      experienceLost: BigInt(4000), // 80% of 5000 XP
      goldLost: BigInt(1000), // 100% of gold
      durabilityDamage: 15, // 15% durability loss
      buffLoss: ['blessing_of_might', 'well_fed', 'rested']
    };
    
    const deathResult: DeathResult = {
      characterId,
      deathLocation: location,
      respawnLocation: graveyard.position,
      respawnGraveyardId: graveyard.id,
      penalties,
      timestamp: new Date()
    };
    
    // Store death status
    const deathStatus: DeathStatus = {
      isDead: true,
      deathTime: new Date(),
      deathLocation: location,
      respawnLocation: graveyard.position,
      canResurrect: true,
      resurrectTimeRemaining: 30 // 30 seconds for mock
    };
    
    this.deathRecords.set(characterId, deathStatus);
    
    return deathResult;
  }

  async respawnCharacter(characterId: string, graveyardId?: string): Promise<RespawnResult> {
    logger.info(`MockDeathService: Respawning character ${characterId}`);
    
    const deathStatus = this.deathRecords.get(characterId);
    let graveyard: Graveyard;
    
    if (graveyardId) {
      const found = this.mockGraveyards.find(g => g.id === graveyardId);
      if (!found) {
        throw new Error(`Graveyard ${graveyardId} not found`);
      }
      graveyard = found;
    } else if (deathStatus?.respawnLocation) {
      // Use the graveyard from death
      graveyard = this.mockGraveyards[0]; // Default to first for mock
    } else {
      // Default to starter graveyard
      graveyard = this.mockGraveyards[0];
    }
    
    // Clear death status
    this.deathRecords.delete(characterId);
    
    return {
      characterId,
      graveyardId: graveyard.id,
      position: graveyard.position,
      healthRestored: 50, // 50% health on respawn
      manaRestored: 50, // 50% mana on respawn
      debuffsApplied: ['resurrection_sickness'] // 2 minute debuff
    };
  }

  async getDeathStatus(characterId: string): Promise<DeathStatus | null> {
    logger.info(`MockDeathService: Getting death status for character ${characterId}`);
    
    const status = this.deathRecords.get(characterId);
    if (!status) {
      return null;
    }
    
    // Update resurrect time remaining
    if (status.deathTime) {
      const elapsed = Date.now() - status.deathTime.getTime();
      const remaining = Math.max(0, 30000 - elapsed); // 30 second timer
      status.resurrectTimeRemaining = Math.floor(remaining / 1000);
      status.canResurrect = remaining <= 0;
    }
    
    return status;
  }

  async calculateDeathPenalties(character: any): Promise<DeathPenalties> {
    logger.info(`MockDeathService: Calculating death penalties for character`);
    
    // Mock calculations based on character level
    const level = character.level || 1;
    const totalXP = BigInt(character.experience || 5000);
    const totalGold = BigInt(character.gold || 1000);
    
    return {
      experienceLost: (totalXP * BigInt(80)) / BigInt(100), // 80% XP loss
      goldLost: totalGold, // 100% gold loss
      durabilityDamage: 15, // 15% durability
      buffLoss: ['all_buffs'] // Lose all buffs
    };
  }

  async findNearestGraveyard(zoneId: string, position: Position3D): Promise<Graveyard> {
    logger.info(`MockDeathService: Finding nearest graveyard in zone ${zoneId}`);
    
    // Filter graveyards by zone
    let graveyards = this.mockGraveyards.filter(g => g.zoneId === zoneId);
    
    // If no graveyards in zone, use all graveyards
    if (graveyards.length === 0) {
      graveyards = this.mockGraveyards;
    }
    
    // Find nearest by distance
    let nearest = graveyards[0];
    let minDistance = Infinity;
    
    for (const graveyard of graveyards) {
      const distance = Math.sqrt(
        Math.pow(position.x - graveyard.position.x, 2) +
        Math.pow(position.y - graveyard.position.y, 2) +
        Math.pow(position.z - graveyard.position.z, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = graveyard;
      }
    }
    
    return nearest;
  }
  
  // Helper method for testing - force kill a character
  async forceKill(characterId: string): Promise<void> {
    logger.info(`MockDeathService: Force killing character ${characterId} for testing`);
    
    await this.handleCharacterDeath(characterId, { x: 0, y: 0, z: 0 });
  }
  
  // Helper method for testing - resurrect immediately
  async instantResurrect(characterId: string): Promise<void> {
    logger.info(`MockDeathService: Instant resurrect for character ${characterId}`);
    
    const status = this.deathRecords.get(characterId);
    if (status) {
      status.canResurrect = true;
      status.resurrectTimeRemaining = 0;
    }
  }
}