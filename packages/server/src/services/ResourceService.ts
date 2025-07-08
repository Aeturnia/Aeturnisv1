import { ResourcePool, ResourceUpdate, ResourceModifier, ResourceEvent } from '../types/resources.types';

export class ResourceService {
  // In-memory storage for resources (mock implementation)
  private resources: Map<string, ResourcePool> = new Map();
  private eventHistory: Map<string, ResourceEvent[]> = new Map();

  constructor() {
    // Initialize with default values for demonstration
    this.initializeDefaultResources();
  }

  /**
   * Initialize default resource pools for testing
   */
  private initializeDefaultResources(): void {
    const defaultPool: ResourcePool = {
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      stamina: 30,
      maxStamina: 30,
      hpRegenRate: 1,      // 1 HP per second
      manaRegenRate: 0.5,  // 0.5 Mana per second
      staminaRegenRate: 2, // 2 Stamina per second
      lastRegenTime: Date.now()
    };

    // Create test resources for demo characters
    const testCharIds = [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002'
    ];

    testCharIds.forEach(charId => {
      this.resources.set(charId, { ...defaultPool });
      this.eventHistory.set(charId, []);
    });
  }

  /**
   * Get current resource pool for a character
   */
  async getResources(charId: string): Promise<ResourcePool | null> {
    const pool = this.resources.get(charId);
    if (!pool) {
      return null;
    }

    // Apply regeneration since last update
    this.applyRegeneration(charId, pool);
    return { ...pool };
  }

  /**
   * Update resource pool (combat damage, healing, etc.)
   */
  async updateResources(charId: string, updates: ResourceUpdate[]): Promise<ResourcePool | null> {
    const pool = this.resources.get(charId);
    if (!pool) {
      return null;
    }

    // Apply regeneration first
    this.applyRegeneration(charId, pool);

    // Apply updates
    updates.forEach(update => {
      switch (update.poolType) {
        case 'hp':
          pool.hp = Math.max(0, Math.min(pool.maxHp, pool.hp + update.change));
          break;
        case 'mana':
          pool.mana = Math.max(0, Math.min(pool.maxMana, pool.mana + update.change));
          break;
        case 'stamina':
          pool.stamina = Math.max(0, Math.min(pool.maxStamina, pool.stamina + update.change));
          break;
      }
    });

    // Log the event
    const event: ResourceEvent = {
      charId,
      timestamp: Date.now(),
      updates,
      source: updates[0]?.reason || 'unknown'
    };

    const history = this.eventHistory.get(charId) || [];
    history.push(event);
    this.eventHistory.set(charId, history);

    return { ...pool };
  }

  /**
   * Apply resource modifiers (buffs/debuffs)
   */
  async applyModifier(charId: string, modifier: ResourceModifier): Promise<ResourcePool | null> {
    const updates: ResourceUpdate[] = [{
      charId,
      poolType: modifier.type,
      currentValue: 0, // Will be calculated in updateResources
      maxValue: 0,     // Will be calculated in updateResources
      change: modifier.percentage ? 0 : modifier.value, // Simple flat value for now
      reason: 'skill'
    }];

    return this.updateResources(charId, updates);
  }

  /**
   * Check if character has enough resources for an action
   */
  async checkResourceCost(charId: string, costs: ResourceModifier[]): Promise<boolean> {
    const pool = await this.getResources(charId);
    if (!pool) return false;

    return costs.every(cost => {
      switch (cost.type) {
        case 'hp':
          return pool.hp >= Math.abs(cost.value);
        case 'mana':
          return pool.mana >= Math.abs(cost.value);
        case 'stamina':
          return pool.stamina >= Math.abs(cost.value);
        default:
          return false;
      }
    });
  }

  /**
   * Get resource event history for a character
   */
  async getResourceHistory(charId: string, limit: number = 10): Promise<ResourceEvent[]> {
    const history = this.eventHistory.get(charId) || [];
    return history.slice(-limit);
  }

  /**
   * Reset resources to maximum (for testing/admin)
   */
  async resetResources(charId: string): Promise<ResourcePool | null> {
    const pool = this.resources.get(charId);
    if (!pool) return null;

    pool.hp = pool.maxHp;
    pool.mana = pool.maxMana;
    pool.stamina = pool.maxStamina;
    pool.lastRegenTime = Date.now();

    return { ...pool };
  }

  /**
   * Apply natural regeneration over time
   */
  private applyRegeneration(_charId: string, pool: ResourcePool): void {
    const now = Date.now();
    const timeDelta = (now - pool.lastRegenTime) / 1000; // seconds

    if (timeDelta > 0) {
      // Apply regeneration
      pool.hp = Math.min(pool.maxHp, pool.hp + (pool.hpRegenRate * timeDelta));
      pool.mana = Math.min(pool.maxMana, pool.mana + (pool.manaRegenRate * timeDelta));
      pool.stamina = Math.min(pool.maxStamina, pool.stamina + (pool.staminaRegenRate * timeDelta));
      
      pool.lastRegenTime = now;
    }
  }

  /**
   * Calculate max resources based on character stats (mock implementation)
   */
  async calculateMaxResources(_charId: string, level: number, stats: Record<string, number>): Promise<Partial<ResourcePool>> {
    // Mock calculation based on level and stats
    const baseHp = 100;
    const baseMana = 50;
    const baseStamina = 30;

    return {
      maxHp: baseHp + (level * 10) + (stats.constitution || 0) * 5,
      maxMana: baseMana + (level * 5) + (stats.intelligence || 0) * 3,
      maxStamina: baseStamina + (level * 3) + (stats.dexterity || 0) * 2,
      hpRegenRate: 1 + (stats.constitution || 0) * 0.1,
      manaRegenRate: 0.5 + (stats.wisdom || 0) * 0.05,
      staminaRegenRate: 2 + (stats.dexterity || 0) * 0.2
    };
  }

  /**
   * Get current resource percentages
   */
  async getResourcePercentages(charId: string): Promise<Record<string, number> | null> {
    const pool = await this.getResources(charId);
    if (!pool) return null;

    return {
      hp: (pool.hp / pool.maxHp) * 100,
      mana: (pool.mana / pool.maxMana) * 100,
      stamina: (pool.stamina / pool.maxStamina) * 100
    };
  }
}