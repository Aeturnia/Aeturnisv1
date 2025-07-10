import { MockService } from './base/MockService';
import { ICharacterService } from '../provider/interfaces/ICharacterService';
import { StateManager } from '../state/StateManager';
import { ServiceLayerConfig } from '../index';

const mockCharacter = {
  id: 'char-1',
  name: 'Aria Starweaver',
  level: 42,
  experience: 125000,
  experienceToNext: 150000,
  health: 2800,
  maxHealth: 3200,
  mana: 1500,
  maxMana: 1800,
  stamina: 150,
  maxStamina: 200,
  attributes: {
    strength: 45,
    dexterity: 62,
    intelligence: 78,
    wisdom: 56,
    constitution: 52,
    charisma: 34
  },
  derived: {
    attackPower: 234,
    spellPower: 312,
    defense: 156,
    critChance: 0.24,
    critDamage: 2.1,
    dodge: 0.18,
    blockChance: 0.15,
    blockValue: 89
  },
  race: 'Elf',
  class: 'Mystic Archer',
  guild: 'Starlight Covenant',
  title: 'Voidwalker'
};

export class MockCharacterService extends MockService implements ICharacterService {
  private stateManager: StateManager;
  private character: any;

  constructor(
    dependencies: {
      stateManager: StateManager;
    },
    config?: ServiceLayerConfig['mockConfig']
  ) {
    super(config);
    this.stateManager = dependencies.stateManager;
    this.character = { ...mockCharacter };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize character state slice
    this.stateManager.createSlice('character', {
      data: this.character,
      isLoading: false,
      error: null
    });
  }

  async getCharacter(): Promise<any> {
    this.stateManager.updateSlice('character', { isLoading: true });

    try {
      const character = await this.getMockData(this.character);
      
      this.stateManager.updateSlice('character', { 
        data: character,
        isLoading: false,
        error: null 
      });

      return character;
    } catch (error) {
      this.stateManager.updateSlice('character', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async updateStats(stats: Partial<any>): Promise<any> {
    this.stateManager.updateSlice('character', { isLoading: true });

    try {
      // Simulate stat update
      this.character = {
        ...this.character,
        attributes: {
          ...this.character.attributes,
          ...stats
        }
      };

      // Recalculate derived stats
      this.character.derived = {
        ...this.character.derived,
        attackPower: Math.floor((this.character.attributes.strength * 3 + this.character.attributes.dexterity * 2) * 1.1),
        spellPower: Math.floor((this.character.attributes.intelligence * 4 + this.character.attributes.wisdom * 2) * 1.1),
        defense: Math.floor((this.character.attributes.constitution * 3 + this.character.attributes.strength) * 1.1)
      };

      const updated = await this.getMockData(this.character);
      
      this.stateManager.updateSlice('character', { 
        data: updated,
        isLoading: false 
      });

      this.emit('character:updated', updated);
      return updated;
    } catch (error) {
      this.stateManager.updateSlice('character', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async levelUp(): Promise<any> {
    this.stateManager.updateSlice('character', { isLoading: true });

    try {
      // Simulate level up
      this.character.level += 1;
      this.character.experience = 0;
      this.character.experienceToNext = this.character.level * 5000;
      
      // Increase stats
      this.character.maxHealth += 100;
      this.character.health = this.character.maxHealth;
      this.character.maxMana += 50;
      this.character.mana = this.character.maxMana;
      
      // Increase attributes
      Object.keys(this.character.attributes).forEach(attr => {
        this.character.attributes[attr] += 2;
      });

      const updated = await this.getMockData(this.character);
      
      this.stateManager.updateSlice('character', { 
        data: updated,
        isLoading: false 
      });

      this.emit('character:levelup', updated);
      return updated;
    } catch (error) {
      this.stateManager.updateSlice('character', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async getEquipment(): Promise<any> {
    return this.getMockData({
      head: { id: 'helm-1', name: 'Crown of Stars', rarity: 'legendary' },
      chest: { id: 'chest-1', name: 'Ethereal Robes', rarity: 'epic' },
      weapon: { id: 'bow-1', name: 'Whisperwind Bow', rarity: 'legendary' },
      offhand: { id: 'quiver-1', name: 'Infinite Quiver', rarity: 'epic' }
    });
  }

  onCharacterUpdate(callback: (character: any) => void): () => void {
    const handleUpdate = (data: any) => callback(data);
    this.on('character:updated', handleUpdate);
    this.on('character:levelup', handleUpdate);
    return () => {
      this.off('character:updated', handleUpdate);
      this.off('character:levelup', handleUpdate);
    };
  }

  destroy(): void {
    super.destroy();
  }
}