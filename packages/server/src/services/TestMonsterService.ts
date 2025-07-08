import { CombatParticipant } from '../types/combat.types';
import { ResourcePool } from '../types/resources.types';

export interface TestMonster {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
}

export class TestMonsterService {
  private monsters: Map<string, TestMonster> = new Map();

  constructor() {
    this.initializeTestMonsters();
  }

  /**
   * Initialize predefined test monsters
   */
  private initializeTestMonsters(): void {
    const testMonsters: TestMonster[] = [
      {
        id: 'test_goblin_001',
        name: 'Training Goblin',
        level: 5,
        hp: 60,
        maxHp: 60,
        mana: 20,
        maxMana: 20,
        stamina: 40,
        maxStamina: 40,
        attack: 15,
        defense: 10,
        speed: 12,
        critRate: 0.05,
        critDamage: 1.2,
        description: 'A weak goblin perfect for combat training',
        difficulty: 'easy'
      },
      {
        id: 'test_orc_001',
        name: 'Practice Orc',
        level: 10,
        hp: 120,
        maxHp: 120,
        mana: 30,
        maxMana: 30,
        stamina: 60,
        maxStamina: 60,
        attack: 25,
        defense: 18,
        speed: 8,
        critRate: 0.08,
        critDamage: 1.3,
        description: 'A sturdy orc for intermediate combat practice',
        difficulty: 'medium'
      },
      {
        id: 'test_dragon_001',
        name: 'Young Training Dragon',
        level: 15,
        hp: 200,
        maxHp: 200,
        mana: 80,
        maxMana: 80,
        stamina: 100,
        maxStamina: 100,
        attack: 40,
        defense: 30,
        speed: 20,
        critRate: 0.15,
        critDamage: 1.8,
        description: 'A powerful young dragon for advanced combat training',
        difficulty: 'hard'
      },
      {
        id: 'test_dummy_001',
        name: 'Combat Training Dummy',
        level: 1,
        hp: 1000,
        maxHp: 1000,
        mana: 0,
        maxMana: 0,
        stamina: 1000,
        maxStamina: 1000,
        attack: 1,
        defense: 100,
        speed: 1,
        critRate: 0,
        critDamage: 1,
        description: 'An indestructible training dummy that barely fights back',
        difficulty: 'easy'
      }
    ];

    testMonsters.forEach(monster => {
      this.monsters.set(monster.id, monster);
    });
  }

  /**
   * Get a test monster by ID
   */
  getTestMonster(monsterId: string): TestMonster | undefined {
    return this.monsters.get(monsterId);
  }

  /**
   * Get all available test monsters
   */
  getAllTestMonsters(): TestMonster[] {
    return Array.from(this.monsters.values());
  }

  /**
   * Check if an ID is a test monster
   */
  isTestMonster(id: string): boolean {
    return id.startsWith('test_') && this.monsters.has(id);
  }

  /**
   * Create a combat participant from a test monster
   */
  createCombatParticipant(monsterId: string): CombatParticipant | null {
    const monster = this.getTestMonster(monsterId);
    if (!monster) {
      return null;
    }

    return {
      charId: monster.id,
      charName: monster.name,
      hp: monster.hp,
      maxHp: monster.maxHp,
      mana: monster.mana,
      maxMana: monster.maxMana,
      stamina: monster.stamina,
      maxStamina: monster.maxStamina,
      team: 'enemy',
      status: 'active',
      buffs: [],
      debuffs: [],
      // AIPE combat stats for test monsters
      level: monster.level,
      attack: monster.attack,
      defense: monster.defense,
      magicalAttack: monster.attack, // Same as physical for simplicity
      magicalDefense: monster.defense,
      speed: monster.speed,
      criticalChance: monster.critRate * 100, // Convert to percentage
      criticalDamage: monster.critDamage * 100, // Convert to percentage
      dodgeChance: 0, // Test monsters don't dodge
      blockChance: 0, // Test monsters don't block
      accuracy: 100, // Test monsters always hit
      weaponMinDamage: Math.floor(monster.attack * 0.8),
      weaponMaxDamage: Math.floor(monster.attack * 1.2)
    };
  }

  /**
   * Get combat stats for a test monster
   */
  getTestMonsterCombatStats(monsterId: string) {
    const monster = this.getTestMonster(monsterId);
    if (!monster) {
      return null;
    }

    const resources: ResourcePool = {
      hp: monster.hp,
      maxHp: monster.maxHp,
      mana: monster.mana,
      maxMana: monster.maxMana,
      stamina: monster.stamina,
      maxStamina: monster.maxStamina,
      hpRegenRate: 0.5,
      manaRegenRate: 0.2,
      staminaRegenRate: 1,
      lastRegenTime: Date.now()
    };

    return {
      charId: monster.id,
      level: monster.level,
      attack: monster.attack,
      defense: monster.defense,
      speed: monster.speed,
      critRate: monster.critRate,
      critDamage: monster.critDamage,
      resources
    };
  }

  /**
   * Get a random test monster by difficulty
   */
  getRandomMonsterByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'boss'): TestMonster | null {
    const monsters = Array.from(this.monsters.values()).filter(m => m.difficulty === difficulty);
    if (monsters.length === 0) {
      return null;
    }
    return monsters[Math.floor(Math.random() * monsters.length)];
  }
}

// Export singleton instance
export const testMonsterService = new TestMonsterService();